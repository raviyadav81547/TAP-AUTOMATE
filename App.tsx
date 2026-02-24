
import React, { useState } from 'react';
import { AppState, Article, Language, AudioSettings, VoicePreset, AIModel } from './types';
import { ArticleInput } from './components/ArticleInput';
import { AudioPlayer } from './components/AudioPlayer';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { summarizeArticles, generateSpeech, generateCoverImage } from './services/geminiService';
import { Headphones, Sparkles, AlertCircle, Download, ArrowLeft, Globe, Mic, Cpu, ShieldAlert } from 'lucide-react';
import { VOICE_PRESETS } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [articles, setArticles] = useState<Article[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  
  // Settings State
  const [voicePresets, setVoicePresets] = useState<VoicePreset[]>(VOICE_PRESETS);
  const [selectedVoicePreset, setSelectedVoicePreset] = useState<VoicePreset>(VOICE_PRESETS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-2.5-flash');
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({ speed: 1.0, pitch: 0 });
  const [isDirectRead, setIsDirectRead] = useState<boolean>(false);

  // Filter out hidden voices for non-admin view
  const activeVoices = voicePresets.filter(v => !v.isHidden);

  const handleGenerate = async () => {
    if (articles.length === 0) return;
    
    setError(null);
    setAppState(AppState.SUMMARIZING);

    try {
      const combinedText = articles.map(a => {
        return isDirectRead ? a.content : `${a.title}\n${a.content}`;
      }).join(isDirectRead ? '\n\n' : '\n\n---\n\n');
      
      let generatedSummary = combinedText;
      let generatedCover = null;

      if (!isDirectRead) {
        const summaryPromise = summarizeArticles(combinedText, selectedLanguage, selectedVoicePreset.style, selectedModel);
        const coverImagePromise = generateCoverImage(combinedText);
        
        const [sum, cov] = await Promise.all([summaryPromise, coverImagePromise]);
        generatedSummary = sum;
        generatedCover = cov;
      } else {
        generatedCover = await generateCoverImage(combinedText);
      }

      setSummary(generatedSummary);
      setCoverImage(generatedCover);
      
      setAppState(AppState.GENERATING_AUDIO);

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await generateSpeech(generatedSummary, selectedVoicePreset.baseModel, audioCtx);
      
      setAudioBuffer(buffer);
      setAppState(AppState.PLAYING);
      
      if (audioCtx.state !== 'closed') audioCtx.close();

    } catch (err) {
      console.error(err);
      setError("Unable to process request. Please verify API availability or try a shorter text.");
      setAppState(AppState.IDLE);
    }
  };

  const handleStartOver = () => {
    setAppState(AppState.IDLE);
    setAudioBuffer(null);
    setSummary('');
    setCoverImage(null);
    setError(null);
  };

  const handleAdminLogin = (id: string, pswrd: string) => {
    if (id === 'admin' && pswrd === 'gemini-studio-2025') {
      setAppState(AppState.ADMIN_DASHBOARD);
      setAdminError(null);
    } else {
      setAdminError("Invalid Credentials. Access Denied.");
    }
  };

  const handleDownloadTranscript = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newscast_transcript_${selectedLanguage.toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (appState === AppState.ADMIN_DASHBOARD) {
    return (
      <AdminDashboard 
        voices={voicePresets} 
        setVoices={setVoicePresets} 
        onLogout={() => setAppState(AppState.IDLE)} 
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-neon-cyan/30 flex flex-col">
      
      {/* Background Shapes */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-magenta/5 rounded-full blur-[80px] pointer-events-none" />

      {appState === AppState.ADMIN_LOGIN && (
        <AdminLogin 
          onLogin={handleAdminLogin} 
          onCancel={() => setAppState(AppState.IDLE)} 
          error={adminError}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleStartOver}>
            <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">NewsCast<span className="text-neon-cyan">.AI</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-slate-400 uppercase tracking-widest">
            <span className="text-white border-b border-neon-cyan pb-0.5">Studio</span>
            <span className="hover:text-white transition-colors cursor-pointer">Archive</span>
            <span className="hover:text-white transition-colors cursor-pointer">Settings</span>
          </div>
        </header>

        {/* Hero Section */}
        {appState === AppState.IDLE && (
          <div className="space-y-10 animate-fade-in-down mb-10 text-center">
            <div className="space-y-4 pt-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-magenta">
                  Studio Quality Audio
                </span> <br />
                <span className="text-slate-500 text-3xl md:text-5xl">from your text.</span>
              </h1>
              <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
                The AI-powered production suite. Summarize news or broadcast raw scripts instantly.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { icon: Mic, color: 'text-neon-cyan', title: 'Voice Cloning', desc: 'Clone your voice with a 10s sample.', border: 'hover:border-neon-cyan/30' },
                { icon: Globe, color: 'text-neon-magenta', title: 'Multi-Lingual', desc: 'Native neural voices in Hindi, Spanish & more.', border: 'hover:border-neon-magenta/30' },
                { icon: Cpu, color: 'text-neon-violet', title: 'Gemini 3 Pro', desc: 'Ultra-realistic output and reasoning.', border: 'hover:border-neon-violet/30' }
              ].map((f, i) => (
                <div key={i} className={`glass-panel p-5 rounded-xl border border-white/5 ${f.border} transition-all group bg-slate-900/40`}>
                  <div className="flex items-center gap-3 mb-2">
                    <f.icon className={`w-5 h-5 ${f.color} group-hover:scale-110 transition-transform`} />
                    <h3 className="font-bold text-white text-sm">{f.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed text-left">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <main>
          {error && (
            <div className="mb-6 max-w-2xl mx-auto p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 animate-pulse text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {appState === AppState.IDLE && (
            <ArticleInput 
              articles={articles} 
              setArticles={setArticles} 
              onGenerate={handleGenerate}
              isLoading={false}
              selectedVoicePreset={selectedVoicePreset}
              setSelectedVoicePreset={setSelectedVoicePreset}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              audioSettings={audioSettings}
              setAudioSettings={setAudioSettings}
              voices={activeVoices} 
              setVoices={setVoicePresets}
              isDirectRead={isDirectRead}
              setIsDirectRead={setIsDirectRead}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          )}

          {(appState === AppState.SUMMARIZING || appState === AppState.GENERATING_AUDIO) && (
            <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-fade-in min-h-[40vh]">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan blur-3xl opacity-20 animate-pulse rounded-full"></div>
                <div className="w-20 h-20 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-center relative z-10 shadow-2xl rotate-45">
                  <Sparkles className="w-8 h-8 text-neon-cyan animate-spin-slow -rotate-45" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-bold text-white font-mono tracking-tight uppercase">
                  {appState === AppState.SUMMARIZING ? (isDirectRead ? 'PREPARING_SCRIPT' : 'ANALYZING_CONTENT') : 'SYNTHESIZING_BROADCAST'}
                </h3>
                <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">Via {selectedModel}</p>
              </div>
              <div className="w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta animate-progress origin-left w-full"></div>
              </div>
            </div>
          )}

          {appState === AppState.PLAYING && (
            <div className="animate-fade-in space-y-8">
               <div className="flex justify-center">
                 <button onClick={handleStartOver} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium hover:bg-slate-900 px-4 py-2 rounded-full">
                   <ArrowLeft className="w-4 h-4" /> Back to Studio
                 </button>
               </div>
              <AudioPlayer 
                audioBuffer={audioBuffer} 
                onRestart={handleStartOver} 
                title={`${selectedVoicePreset.name}'s ${isDirectRead ? 'Direct Read' : 'Daily Briefing'}`}
                settings={audioSettings}
                onUpdateSettings={setAudioSettings}
                coverImage={coverImage}
              />
              <div className="max-w-4xl mx-auto glass-panel rounded-xl p-6 border-t border-neon-magenta/20 bg-slate-900/50">
                 <div className="flex items-center justify-between mb-4">
                   <h4 className="text-xs font-bold text-neon-magenta uppercase tracking-widest font-mono">Generated Transcript</h4>
                   <button onClick={handleDownloadTranscript} className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors border border-slate-700 uppercase tracking-wider">
                     <Download className="w-3 h-3" /> Download TXT
                   </button>
                 </div>
                 <div className="prose prose-invert prose-sm max-w-none font-sans leading-relaxed h-48 overflow-y-auto pr-4 custom-scrollbar text-slate-400">
                   {summary.split('\n').map((line, i) => <p key={i} className="mb-3">{line}</p>)}
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer / Admin Access */}
      <footer className="relative z-10 border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-slate-600 text-[10px] font-mono uppercase tracking-widest">
            © 2025 NewsCast Studio • AI Production Suite
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setAppState(AppState.ADMIN_LOGIN)}
              className="flex items-center gap-2 text-slate-700 hover:text-neon-violet transition-colors text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              <ShieldAlert className="w-3 h-3" /> System Access
            </button>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes progress { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
        .animate-progress { animation: progress 15s ease-out forwards; }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in-down { animation: fadeInDown 0.8s ease-out; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default App;
