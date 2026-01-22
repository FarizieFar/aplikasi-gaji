
import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation slightly after mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[80px] animate-blob"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[60px] animate-blob animation-delay-2000"></div>
      
      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center transform transition-all duration-1000 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        
        {/* Logo Container */}
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl border border-slate-700/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Zap className="w-10 h-10 text-indigo-500 fill-indigo-500/20" strokeWidth={1.5} />
            </div>
            
            {/* Decor dots */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-violet-500 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-400 rounded-full animate-bounce animation-delay-500"></div>
        </div>

        {/* Text Branding */}
        <div className="text-center space-y-3">
            <h1 className="text-4xl font-black text-white tracking-tight">
                TimeMaster
            </h1>
            <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-indigo-500"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                    Workspace
                </p>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-indigo-500"></div>
            </div>
        </div>
      </div>

      {/* Loading Indicator at Bottom */}
      <div className="absolute bottom-12 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide animate-pulse">Memuat aplikasi...</span>
      </div>
    </div>
  );
};
