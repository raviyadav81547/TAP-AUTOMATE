import React, { useState, useRef, useEffect } from 'react';
import { Clipboard, Plus, FileText, Trash2, Mic, MicOff, Settings, Play, Sliders, Globe, Radio, Layers, User, CheckCircle2, FlaskConical, X, Activity, Zap, Cpu } from 'lucide-react';
import { Article, Language, AudioSettings, VoicePreset, AIModel } from '../types';
import { generateVoicePreview } from '../services/geminiService';

interface ArticleInputProps {
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  onGenerate: () => void;
  isLoading: boolean;
  selectedVoicePreset: VoicePreset;
  setSelectedVoicePreset: (v: VoicePreset) => void;
  selectedLanguage: Language;
  setSelectedLanguage: (l: Language) => void;
  audioSettings: AudioSettings;
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioSettings>>;
  voices: VoicePreset[];
  setVoices: React.Dispatch<React.SetStateAction<VoicePreset[]>>;
  isDirectRead: boolean;
  setIsDirectRead: React.Dispatch<React.SetStateAction<boolean>>;
  selectedModel: AIModel;
  setSelectedModel: (m: AIModel) => void;
}

export const ArticleInput: React.FC<ArticleInputProps> = ({ 
  articles, 
  setArticles, 
  onGenerate, 
  isLoading,
  selectedVoicePreset,
  setSelectedVoicePreset,
  selectedLanguage,
  setSelectedLanguage,
  audioSettings,
  setAudioSettings,
  voices,
  setVoices,
  isDirectRead,
  setIsDirectRead,
  selectedModel,
  setSelectedModel
}) => {
  const [currentText, setCurrentText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);
  
  // Voice Cloning State
  const [showVoiceLab, setShowVoiceLab] = useState(false);
  const [cloneStep, setCloneStep] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      clearInterval(recordingTimerRef.current);
    };
  }, []);

  // When a preset is selected, automatically update pitch/speed to its defaults
  const handlePresetSelect = (preset: VoicePreset) => {
    setSelectedVoicePreset(preset);
    setAudioSettings({
        speed: preset.defaultSpeed,
        pitch: preset.defaultPitch
    });
  };

  const addArticle = () => {
    if (!currentText.trim()) return;
    const newArticle: Article = {
      id: crypto.randomUUID(),
      title: `News Segment ${articles.length + 1}`,
      content: currentText,
    };
    setArticles([...articles, newArticle]);
    setCurrentText('');
  };

  const removeArticle = (id: string) => {
    setArticles(articles.filter(a => a.id !== id));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCurrentText(prev => prev + (prev ? '\n\n' : '') + text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleDictate = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    
    const langMap: Record<Language, string> = {
      'English': 'en-US',
      'Hindi': 'hi-IN',
      'Hinglish': 'hi-IN',
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'German': 'de-DE'
    };
    recognition.lang = langMap[selectedLanguage];

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
         setCurrentText(prev => prev + finalTranscript);
      }
    };

    recognition.start();
  };

  const playPreview = async (preset: VoicePreset) => {
    if (previewPlayingId) return;
    setPreviewPlayingId(preset.id);
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await generateVoicePreview(preset, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setPreviewPlayingId(null);
        ctx.close();
      };
      
      // Apply preset specific settings to the preview
      source.playbackRate.value = preset.defaultSpeed;
      source.detune.value = preset.defaultPitch;
      
      source.start();
    } catch (e) {
      console.error(e);
      setPreviewPlayingId(null);
    }
  };

  // --- Voice Cloning Logic ---
  const handleStartCloning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
         // In a real app, upload blob here.
         // Simulating processing delay
         setCloneStep('processing');
         setTimeout(() => {
           createCustomVoice();
           setCloneStep('done');
           stream.getTracks().forEach(track => track.stop());
         }, 3000);
      };

      mediaRecorderRef.current.start();
      setCloneStep('recording');
      setRecordingTime(0);
      
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
           if (prev >= 10) {
             handleStopCloning();
             return 10;
           }
           return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access needed for voice cloning.");
    }
  };

  const handleStopCloning = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      clearInterval(recordingTimerRef.current);
    }
  };

  const createCustomVoice = () => {
    const newVoice: VoicePreset = {
      id: `custom-${Date.now()}`,
      name: `My Clone ${voices.filter(v => v.isCustom).length + 1}`,
      gender: 'Male', // Default, ideally user selects
      style: 'Custom Clone',
      baseModel: 'Fenrir', // Use Fenrir as a robust base
      flag: '🧬',
      description: 'AI-generated voice clone from user sample.',
      defaultPitch: 0,
      defaultSpeed: 1.0,
      isCustom: true
    };
    
    setVoices(prev => [newVoice, ...prev]);
    handlePresetSelect(newVoice);
  };

  const resetVoiceLab = () => {
    setCloneStep('idle');
    setRecordingTime(0);
    setShowVoiceLab(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* LEFT COLUMN: Input & Queue */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* EDITOR CARD */}
        <div className={`glass-panel rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 ${isListening ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-slate-800 hover:border-slate-700'}`}>
           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neon-cyan to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity" />
           
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-neon-cyan" />
              Script_Editor
            </h2>
            {isListening && (
              <span className="flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse uppercase tracking-widest border border-red-500/50 px-2 py-0.5 rounded-full bg-red-950/30">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                On Air / Recording
              </span>
            )}
           </div>
          
          <div className="relative">
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder={isListening ? "Listening..." : `Enter text for your ${selectedLanguage} broadcast...`}
              className={`w-full h-48 bg-slate-950/50 border rounded-xl p-4 text-slate-300 placeholder:text-slate-600 focus:outline-none resize-none font-sans leading-relaxed transition-all ${isListening ? 'border-red-500/30 ring-1 ring-red-500/20' : 'border-slate-800 focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50'}`}
            />
            
            <div className="absolute bottom-4 right-4 flex gap-2">
               <button
                onClick={handleDictate}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 backdrop-blur-md border text-xs font-bold uppercase tracking-wider ${isListening ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:border-white'}`}
                title={isListening ? "Stop Recording" : "Start Dictation"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" /> Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" /> Dictate
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePaste}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg flex items-center gap-2 transition-colors text-xs font-bold uppercase tracking-wide"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Paste
            </button>
            <button
              onClick={addArticle}
              disabled={!currentText.trim()}
              className="px-6 py-2 bg-neon-cyan hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg flex items-center gap-2 ml-auto transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold text-xs uppercase tracking-wide"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Segment
            </button>
          </div>
        </div>

        {/* THUMBNAIL GRID QUEUE */}
        {articles.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Broadcast Queue ({articles.length})</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {articles.map((article, idx) => (
                <div key={article.id} className="group relative bg-slate-900/40 border border-slate-800 rounded-lg p-3 hover:border-neon-violet/50 hover:bg-slate-900/60 transition-all duration-300 overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-neon-violet/10 rounded-full blur-xl group-hover:bg-neon-violet/20 transition-all"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-1.5">
                        <span className="font-mono text-[10px] font-bold text-neon-cyan bg-neon-cyan/10 px-1.5 py-0.5 rounded">
                            SEG {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <button
                            onClick={() => removeArticle(article.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <h4 className="text-slate-200 font-bold text-sm mb-1 truncate pr-4">{article.title}</h4>
                    <p className="text-slate-500 text-[10px] line-clamp-2 font-mono leading-relaxed">{article.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 glass-panel rounded-xl border border-slate-800 bg-slate-900/30">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDirectRead ? 'bg-neon-magenta text-white' : 'bg-slate-800 text-slate-500'}`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Direct Read Mode</h4>
                      <p className="text-[10px] text-slate-500">Read exactly what I typed (Skip AI summary)</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDirectRead(!isDirectRead)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isDirectRead ? 'bg-neon-magenta' : 'bg-slate-700'}`}
                  >
                    <span className={`inline-block w-4 h-4 transform transition bg-white rounded-full ${isDirectRead ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
               </div>
               
               <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-neon-violet to-neon-magenta hover:from-violet-500 hover:to-magenta-400 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(217,70,239,0.3)] flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 font-mono">
                    PROCESSING_ASSETS<span className="animate-pulse">...</span>
                  </span>
                ) : (
                  <>
                    <Radio className="w-5 h-5 group-hover:animate-pulse" />
                    Produce Episode
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Studio Settings */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel rounded-2xl p-6 space-y-6 sticky top-6 border border-slate-800/60 shadow-xl max-h-[85vh] overflow-y-auto custom-scrollbar relative">
           
           {/* Voice Lab Banner */}
           {!showVoiceLab && (
             <div 
               onClick={() => setShowVoiceLab(true)}
               className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 p-4 rounded-xl cursor-pointer hover:border-neon-cyan/50 transition-all group relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-20 h-20 bg-neon-cyan/10 rounded-full blur-xl group-hover:bg-neon-cyan/20 transition-all"></div>
                <div className="flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 group-hover:border-neon-cyan/50">
                        <FlaskConical className="w-5 h-5 text-neon-cyan" />
                     </div>
                     <div>
                       <h3 className="font-bold text-white text-sm">Voice Lab <span className="text-[10px] bg-neon-cyan/20 text-neon-cyan px-1.5 py-0.5 rounded ml-1">BETA</span></h3>
                       <p className="text-[10px] text-slate-400">Clone your voice for custom AI output.</p>
                     </div>
                   </div>
                   <Plus className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </div>
             </div>
           )}

           {/* Voice Lab Panel (Overlay/Expand) */}
           {showVoiceLab && (
             <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 animate-fade-in relative">
                <button onClick={resetVoiceLab} className="absolute top-2 right-2 text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
                
                <div className="mb-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-neon-cyan" /> New Voice Clone
                  </h3>
                </div>

                {cloneStep === 'idle' && (
                  <div className="space-y-4">
                     <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-400 font-mono leading-relaxed mb-2">Please read the following sentence clearly:</p>
                        <p className="text-sm text-white font-medium italic">"The quick brown fox jumps over the lazy dog to discover a new world of digital synthesis."</p>
                     </div>
                     <button 
                       onClick={handleStartCloning}
                       className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
                     >
                       <Mic className="w-4 h-4" /> Start Recording
                     </button>
                  </div>
                )}

                {cloneStep === 'recording' && (
                  <div className="space-y-4 text-center py-4">
                     <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                        <Mic className="w-6 h-6 text-red-500 relative z-10" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Recording Sample</p>
                        <p className="text-2xl font-mono text-white">00:{recordingTime.toString().padStart(2, '0')}</p>
                     </div>
                     <div className="flex justify-center gap-1 h-8 items-end">
                       {[1,2,3,4,5,4,3,2,1,2,3,4].map((h, i) => (
                         <div key={i} className="w-1 bg-red-500 rounded-t animate-pulse" style={{height: `${h*20}%`, animationDelay: `${i*0.1}s`}}></div>
                       ))}
                     </div>
                     <button 
                       onClick={handleStopCloning}
                       className="text-xs text-slate-400 hover:text-white underline"
                     >
                       Stop & Process
                     </button>
                  </div>
                )}

                {cloneStep === 'processing' && (
                  <div className="space-y-4 text-center py-4">
                     <div className="w-12 h-12 mx-auto border-2 border-slate-700 border-t-neon-cyan rounded-full animate-spin"></div>
                     <p className="text-xs font-bold text-neon-cyan uppercase tracking-widest animate-pulse">Analyzing Voiceprint...</p>
                     <p className="text-[10px] text-slate-500">Creating neural map • Generating config</p>
                  </div>
                )}

                {cloneStep === 'done' && (
                  <div className="text-center py-2 space-y-3">
                     <div className="flex items-center justify-center w-10 h-10 mx-auto bg-green-500/20 text-green-500 rounded-full">
                       <CheckCircle2 className="w-5 h-5" />
                     </div>
                     <p className="text-sm font-bold text-white">Voice Clone Created!</p>
                     <button onClick={resetVoiceLab} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold">
                       Done
                     </button>
                  </div>
                )}

             </div>
           )}

           {/* AI Model */}
           <div className={`space-y-3 transition-opacity ${isDirectRead ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <Cpu className="w-3 h-3" /> Intelligence Model
             </label>
             <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as AIModel)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-neon-cyan text-sm transition-colors"
             >
               <option value="gemini-2.5-flash">Gemini 2.5 Flash (Standard)</option>
               <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Advanced)</option>
             </select>
           </div>

           {/* Language */}
           <div className={`space-y-3 transition-opacity ${isDirectRead ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <Globe className="w-3 h-3" /> Broadcast Language
             </label>
             <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-neon-magenta text-sm transition-colors"
             >
               <option value="English">English (US)</option>
               <option value="Hindi">Hindi (हिन्दी)</option>
               <option value="Hinglish">Hinglish (Indian Casual)</option>
               <option value="Spanish">Spanish (Español)</option>
               <option value="French">French (Français)</option>
               <option value="German">German (Deutsch)</option>
             </select>
             {isDirectRead && <p className="text-[10px] text-neon-magenta">AI disabled in Direct Read mode.</p>}
           </div>

           {/* Voice Library */}
           <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Voice Model Library ({voices.length})
                </label>
             </div>
             
             <div className="grid grid-cols-2 gap-2 h-64 overflow-y-auto pr-1 custom-scrollbar">
                {voices.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-2.5 rounded-lg border text-left transition-all relative group ${
                      selectedVoicePreset.id === preset.id 
                      ? 'bg-neon-cyan/10 border-neon-cyan text-white shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-base">{preset.flag}</span>
                      {selectedVoicePreset.id === preset.id && <CheckCircle2 className="w-3.5 h-3.5 text-neon-cyan" />}
                    </div>
                    <div className="font-bold text-xs truncate flex items-center gap-1">
                       {preset.name}
                       {preset.isCustom && <span className="w-1.5 h-1.5 bg-neon-magenta rounded-full"></span>}
                    </div>
                    <div className="text-[10px] opacity-70 truncate">{preset.style}</div>
                    
                    <div 
                      onClick={(e) => { e.stopPropagation(); playPreview(preset); }}
                      className="absolute bottom-2 right-2 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-neon-cyan hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      {previewPlayingId === preset.id ? <div className="w-3 h-3 bg-white rounded-full animate-pulse" /> : <Play className="w-3 h-3 fill-current" />}
                    </div>
                  </button>
                ))}
             </div>
           </div>

           {/* Advanced Controls */}
           <div className="space-y-5 pt-5 border-t border-slate-800/50">
             <div className="space-y-2">
               <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  <span className="flex items-center gap-2"><Sliders className="w-3 h-3" /> Playback Speed</span>
                  <span className="text-neon-cyan font-mono">{audioSettings.speed}x</span>
               </div>
               <input 
                  type="range" 
                  min="0.5" 
                  max="3.0" 
                  step="0.05" 
                  value={audioSettings.speed}
                  onChange={(e) => setAudioSettings(prev => ({...prev, speed: parseFloat(e.target.value)}))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
               />
               <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                 <span>0.5x</span>
                 <span>1.0x</span>
                 <span>2.0x</span>
                 <span>3.0x</span>
               </div>
             </div>

             <div className="space-y-2">
               <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  <span className="flex items-center gap-2"><Sliders className="w-3 h-3" /> Tone / Pitch</span>
                  <span className="text-neon-cyan font-mono">{audioSettings.pitch > 0 ? '+' : ''}{audioSettings.pitch}</span>
               </div>
               <input 
                  type="range" 
                  min="-600" 
                  max="600" 
                  step="50" 
                  value={audioSettings.pitch}
                  onChange={(e) => setAudioSettings(prev => ({...prev, pitch: parseInt(e.target.value)}))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
               />
               <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                 <span>Low</span>
                 <span>Normal</span>
                 <span>High</span>
               </div>
             </div>
           </div>

        </div>
      </div>

    </div>
  );
};