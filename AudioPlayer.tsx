import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Music, Sliders } from 'lucide-react';
import { audioBufferToWav } from '../utils/audioUtils';
import { AudioSettings } from '../types';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  onRestart: () => void;
  title?: string;
  settings: AudioSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<AudioSettings>>;
  coverImage: string | null;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioBuffer, 
  onRestart, 
  title = "Daily Commute Summary", 
  settings, 
  onUpdateSettings,
  coverImage 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1.0); // 0.0 to 1.0
  const prevVolumeRef = useRef(1.0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume; // Set initial volume

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    
    return () => {
      stopAudio();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
      audioContextRef.current = null;
    };
  }, []);

  // Update volume in real-time
  useEffect(() => {
    if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Update playback settings in real-time if playing
  useEffect(() => {
    if (sourceNodeRef.current && isPlaying) {
      sourceNodeRef.current.playbackRate.value = settings.speed;
      sourceNodeRef.current.detune.value = settings.pitch;
    }
  }, [settings, isPlaying]);

  const playAudio = () => {
    if (!audioBuffer || !audioContextRef.current || !gainNodeRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    
    source.playbackRate.value = settings.speed;
    source.detune.value = settings.pitch;

    source.connect(gainNodeRef.current);
    
    const offset = pauseTimeRef.current; 
    
    source.start(0, offset);
    
    startTimeRef.current = audioContextRef.current.currentTime - (offset / settings.speed);
    
    sourceNodeRef.current = source;
    setIsPlaying(true);

    source.onended = () => {
      // Handled via progress loop
    };

    updateProgress();
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current && isPlaying) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
      
      if (audioContextRef.current) {
        const elapsedWall = audioContextRef.current.currentTime - startTimeRef.current;
        pauseTimeRef.current = elapsedWall * settings.speed;
      }
      
      setIsPlaying(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
    pauseTimeRef.current = 0;
    setProgress(0);
    setCurrentTime(0);
  };

  const updateProgress = () => {
    if (!audioContextRef.current || !isPlaying || !audioBuffer) return;

    const elapsedWall = audioContextRef.current.currentTime - startTimeRef.current;
    
    const elapsedBuffer = elapsedWall * settings.speed;
    const duration = audioBuffer.duration;
    
    if (elapsedBuffer >= duration) {
       setIsPlaying(false);
       pauseTimeRef.current = 0;
       setProgress(0);
       return;
    }

    setCurrentTime(elapsedBuffer);
    setProgress((elapsedBuffer / duration) * 100);
    
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      prevVolumeRef.current = volume;
      setVolume(0);
    } else {
      setVolume(prevVolumeRef.current || 0.5);
    }
  };

  const handleDownload = () => {
    if (!audioBuffer) return;
    const wavBlob = audioBufferToWav(audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'newscast_summary.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [visualData, setVisualData] = useState<number[]>(new Array(30).fill(10));

  useEffect(() => {
    if (!isPlaying || !analyserRef.current) return;
    
    const interval = setInterval(() => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const step = Math.ceil(dataArray.length / 30);
        const newData = [];
        for(let i=0; i<30; i++) {
            newData.push(dataArray[i*step] || 10);
        }
        setVisualData(newData);
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);


  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div className="glass-panel border-neon-cyan/20 rounded-3xl p-8 relative overflow-hidden group">
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Cover Art / Thumbnail */}
            <div className="md:col-span-4 flex justify-center md:justify-start">
                 <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-blue-600/20 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-500">
                    {coverImage ? (
                      <img src={coverImage} alt="Cover Art" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Music className="w-12 h-12 text-neon-cyan opacity-50" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">No Cover Art</span>
                      </div>
                    )}
                    {/* Gloss Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                </div>
            </div>

            <div className="md:col-span-8 space-y-6">
                
                 <div>
                    <h2 className="text-2xl font-bold text-white font-mono tracking-tight line-clamp-2">{title}</h2>
                    <p className="text-neon-cyan text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      Now Playing
                    </p>
                </div>

                {/* Visualizer */}
                <div className="flex items-end justify-between gap-1 h-12 w-full mb-4 px-1 opacity-80">
                    {visualData.map((val, i) => (
                    <div
                        key={i}
                        className="w-full bg-gradient-to-t from-neon-violet to-neon-cyan rounded-t-sm transition-all duration-75 shadow-[0_0_5px_rgba(139,92,246,0.5)]"
                        style={{
                            height: `${Math.max(5, val / 2.5)}%`,
                            opacity: isPlaying ? 1 : 0.3
                        }}
                    />
                    ))}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{audioBuffer ? formatTime(audioBuffer.duration) : '0:00'}</span>
                    </div>
                    <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer group/bar">
                    <div 
                        className="absolute top-0 left-0 h-full bg-neon-cyan shadow-[0_0_10px_#06b6d4] rounded-full transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                    <div className="absolute top-0 left-0 h-full w-full bg-white/5 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                    </div>
                </div>

                {/* Controls Container */}
                <div className="flex flex-col gap-6 pt-2">
                  
                  {/* Row 1: Main Transport */}
                  <div className="flex items-center justify-between">
                      <button
                          onClick={stopAudio}
                          className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full transition-all"
                          title="Reset"
                      >
                          <RotateCcw className="w-5 h-5" />
                      </button>
                      
                      <button
                          onClick={togglePlay}
                          className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-all group/play"
                      >
                          {isPlaying ? (
                          <Pause className="w-6 h-6 fill-current group-hover/play:scale-90 transition-transform" />
                          ) : (
                          <Play className="w-6 h-6 fill-current ml-1 group-hover/play:scale-110 transition-transform" />
                          )}
                      </button>
                      
                      <button
                          onClick={handleDownload}
                          className="p-3 text-slate-400 hover:text-neon-cyan hover:bg-slate-800/50 rounded-full transition-all"
                          title="Download .wav"
                      >
                          <Download className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Row 2: Volume & Speed Integrated */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-white/5">
                    
                     {/* Volume Control */}
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={toggleMute}
                          className="text-slate-400 hover:text-white transition-colors p-1"
                          title={volume === 0 ? "Unmute" : "Mute"}
                        >
                           {volume === 0 ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 flex flex-col gap-1">
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-cyan hover:accent-cyan-300"
                          />
                        </div>
                        <span className="text-[10px] font-mono w-8 text-right text-slate-500">{Math.round(volume * 100)}%</span>
                     </div>

                     {/* Speed Control */}
                     <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 sm:border-l sm:pl-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                           <Sliders className="w-3 h-3" /> Speed
                        </span>
                        <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                           <button 
                              onClick={() => onUpdateSettings(prev => ({...prev, speed: Math.max(0.5, prev.speed - 0.1)}))}
                              className="px-2 py-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded text-xs transition-colors"
                           >-</button>
                           <span className="min-w-[36px] text-center text-xs font-mono font-bold text-neon-cyan">{settings.speed.toFixed(1)}x</span>
                           <button 
                              onClick={() => onUpdateSettings(prev => ({...prev, speed: Math.min(3.0, prev.speed + 0.1)}))}
                              className="px-2 py-0.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded text-xs transition-colors"
                           >+</button>
                        </div>
                     </div>

                  </div>

                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
