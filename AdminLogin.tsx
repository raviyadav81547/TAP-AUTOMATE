
import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, Fingerprint, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (id: string, pswrd: string) => void;
  onCancel: () => void;
  error: string | null;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel, error }) => {
  const [id, setId] = useState('');
  const [pswrd, setPswrd] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(id, pswrd);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md p-1 bg-gradient-to-br from-neon-violet via-neon-blue to-neon-cyan rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.3)]">
        <div className="bg-slate-950 rounded-[15px] p-8 space-y-6 relative overflow-hidden">
          {/* Decorative Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#8b5cf6 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
          
          <div className="text-center relative z-10">
            <div className="w-16 h-16 bg-slate-900 border border-neon-violet/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <ShieldCheck className="w-8 h-8 text-neon-violet animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase font-mono">System_Auth</h2>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Restricted Access Area</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Administrator_ID</label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-violet transition-all font-mono text-sm"
                  placeholder="Enter ID..."
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access_Cipher</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="password"
                  value={pswrd}
                  onChange={(e) => setPswrd(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-violet transition-all font-mono text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-wider bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-neon-violet hover:bg-violet-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95"
            >
              Initialize Session <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <button
            onClick={onCancel}
            className="w-full text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            Abort Connection
          </button>
        </div>
      </div>
    </div>
  );
};
