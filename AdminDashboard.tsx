
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Cpu, Database, Users, Settings, LogOut, 
  Activity, Zap, Shield, HardDrive, RefreshCw, Eye, EyeOff, Search,
  ExternalLink, Globe, Copy, Share2, Check
} from 'lucide-react';
import { VoicePreset } from '../types';

interface AdminDashboardProps {
  voices: VoicePreset[];
  setVoices: React.Dispatch<React.SetStateAction<VoicePreset[]>>;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ voices, setVoices, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'voices' | 'system'>('overview');
  const [copied, setCopied] = useState(false);
  const [metrics, setMetrics] = useState({
    cpu: 12,
    ram: 45,
    latency: 184,
    tokens: 42091,
    activeUsers: 3
  });

  const publicUrl = window.location.origin;

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(8, Math.min(24, prev.cpu + (Math.random() * 4 - 2))),
        latency: Math.max(150, Math.min(250, prev.latency + (Math.random() * 20 - 10))),
        tokens: prev.tokens + Math.floor(Math.random() * 5),
        activeUsers: Math.max(1, prev.activeUsers + (Math.random() > 0.7 ? 1 : -1))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleVoiceVisibility = (id: string) => {
    setVoices(prev => prev.map(v => v.id === id ? { ...v, isHidden: !v.isHidden } : v));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono text-sm flex flex-col animate-fade-in">
      {/* Admin Navbar */}
      <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon-violet rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold leading-none">NewsCast_Admin</h1>
            <span className="text-[10px] text-neon-violet uppercase tracking-widest font-bold">Root Access • v3.4.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase">System Status</span>
              <span className="text-[10px] text-green-500 flex items-center gap-1 uppercase font-bold">
                <Activity className="w-2 h-2" /> All Systems Nominal
              </span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 border-r border-white/5 p-4 space-y-2 bg-slate-900/20">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-neon-violet text-white shadow-lg' : 'hover:bg-white/5 text-slate-500 hover:text-white'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider text-xs">Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('voices')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'voices' ? 'bg-neon-violet text-white shadow-lg' : 'hover:bg-white/5 text-slate-500 hover:text-white'}`}
          >
            <Database className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider text-xs">Voice Library</span>
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'system' ? 'bg-neon-violet text-white shadow-lg' : 'hover:bg-white/5 text-slate-500 hover:text-white'}`}
          >
            <Settings className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider text-xs">Environment</span>
          </button>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_top_right,#1e1b4b,transparent_40%)]">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* Public Link Card */}
              <div className="glass-panel p-6 rounded-2xl border border-neon-cyan/20 bg-slate-900/40 relative overflow-hidden group shadow-[0_0_30px_rgba(6,182,212,0.05)]">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Globe className="w-32 h-32 text-neon-cyan" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Globe className="w-5 h-5 text-neon-cyan" /> Public_Access_Gateway
                    </h3>
                    <p className="text-slate-500 text-xs font-mono">This is the link your users use to access the studio.</p>
                    <div className="flex items-center gap-2 mt-4 bg-black/40 border border-white/10 rounded-lg p-2 max-w-md">
                      <code className="text-neon-cyan text-xs truncate flex-1">{publicUrl}</code>
                      <button 
                        onClick={handleCopyLink}
                        className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"
                        title="Copy Link"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a 
                        href={publicUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                       <span className="text-[10px] text-slate-500 uppercase block font-bold">Active Public Nodes</span>
                       <span className="text-2xl font-bold text-white flex items-center gap-2 justify-end">
                         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                         {metrics.activeUsers}
                       </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Token Consumption', val: metrics.tokens.toLocaleString(), icon: Zap, color: 'text-yellow-500' },
                  { label: 'CPU Cluster Load', val: `${metrics.cpu.toFixed(1)}%`, icon: Cpu, color: 'text-neon-cyan' },
                  { label: 'API Latency', val: `${metrics.latency}ms`, icon: Activity, color: 'text-neon-magenta' },
                  { label: 'Storage Usage', val: '4.2 TB', icon: HardDrive, color: 'text-green-500' }
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <stat.icon className={`w-8 h-8 ${stat.color} opacity-20 absolute -right-2 -bottom-2 transform rotate-12 group-hover:rotate-0 transition-transform duration-500`} />
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-white">{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* Simulated Chart Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-neon-cyan" /> Network Traffic (24h)
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold">
                       <span className="flex items-center gap-1 text-neon-cyan"><span className="w-2 h-2 bg-neon-cyan rounded-full"></span> Inbound</span>
                       <span className="flex items-center gap-1 text-neon-magenta"><span className="w-2 h-2 bg-neon-magenta rounded-full"></span> Outbound</span>
                    </div>
                  </div>
                  <div className="h-64 flex items-end gap-2 px-4 border-l border-b border-white/10 relative">
                     {/* Bars */}
                     {Array.from({length: 24}).map((_, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-0.5 justify-end group">
                           <div 
                             className="w-full bg-neon-magenta/40 group-hover:bg-neon-magenta transition-all rounded-t-sm" 
                             style={{ height: `${20 + Math.random() * 40}%` }}
                           />
                           <div 
                             className="w-full bg-neon-cyan/40 group-hover:bg-neon-cyan transition-all rounded-t-sm" 
                             style={{ height: `${30 + Math.random() * 50}%` }}
                           />
                        </div>
                     ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-600 px-4 font-bold uppercase">
                     <span>00:00</span>
                     <span>12:00</span>
                     <span>23:59</span>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2 mb-6">
                    <Users className="w-4 h-4 text-neon-violet" /> Concurrent Nodes
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'US-East-1', status: 'online', count: 12 },
                      { name: 'IN-West-2', status: 'online', count: 8 },
                      { name: 'EU-North-1', status: 'online', count: 14 },
                      { name: 'JP-South-1', status: 'degraded', count: 4 }
                    ].map((node, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-yellow-500 animate-pulse'}`} />
                           <span className="text-xs font-bold text-slate-300">{node.name}</span>
                        </div>
                        <span className="text-xs font-mono text-white">{node.count} Nodes</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voices' && (
            <div className="max-w-6xl mx-auto space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                    <Database className="w-6 h-6 text-neon-violet" /> Model Registry
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Filter models..." 
                      className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-neon-violet text-xs"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {voices.map(voice => (
                   <div key={voice.id} className={`glass-panel p-4 rounded-xl border transition-all ${voice.isHidden ? 'opacity-50 grayscale border-slate-800' : 'border-white/5 hover:border-neon-violet/30'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{voice.flag}</span>
                          <div>
                            <h4 className="font-bold text-white leading-none">{voice.name}</h4>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{voice.baseModel} • {voice.style}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleVoiceVisibility(voice.id)}
                          className={`p-2 rounded-lg transition-all ${voice.isHidden ? 'bg-slate-800 text-slate-400' : 'bg-neon-violet/20 text-neon-violet'}`}
                          title={voice.isHidden ? "Make Public" : "Hide from Public"}
                        >
                          {voice.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase mb-4">
                         <div className="bg-slate-900 p-2 rounded border border-white/5">
                            <span className="text-slate-500 block mb-0.5">Pitch</span>
                            <span className="text-white">{voice.defaultPitch}</span>
                         </div>
                         <div className="bg-slate-900 p-2 rounded border border-white/5">
                            <span className="text-slate-500 block mb-0.5">Speed</span>
                            <span className="text-white">{voice.defaultSpeed}x</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${voice.isHidden ? 'bg-slate-700' : 'bg-green-500'}`} />
                         <span className="text-[10px] uppercase font-bold text-slate-500">{voice.isHidden ? 'Inactive' : 'Live in Production'}</span>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="max-w-2xl mx-auto space-y-8 py-10">
               <div className="text-center space-y-2 mb-10">
                  <div className="w-16 h-16 bg-slate-900 rounded-3xl border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">System Configuration</h3>
                  <p className="text-slate-500 text-xs">Manage environment variables and production clusters.</p>
               </div>

               <div className="space-y-4">
                  {[
                    { label: 'API Region', val: 'Global (Auto)', type: 'select' },
                    { label: 'Summarization Depth', val: 'Production High', type: 'select' },
                    { label: 'Neural Sample Rate', val: '24000 Hz', type: 'text' },
                    { label: 'CDN Edge Caching', val: 'Enabled', type: 'toggle' }
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-white/5">
                       <div>
                         <span className="text-xs font-bold text-white block">{setting.label}</span>
                         <span className="text-[10px] text-slate-500 uppercase font-mono">{setting.val}</span>
                       </div>
                       <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase rounded-lg transition-colors border border-white/5">
                          Change
                       </button>
                    </div>
                  ))}
               </div>

               <div className="pt-10 border-t border-white/5 space-y-4">
                  <button className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all">
                    <RefreshCw className="w-4 h-4" /> Purge Cache & Re-deploy
                  </button>
               </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
