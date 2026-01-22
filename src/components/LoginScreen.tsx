
import React, { useState } from 'react';
import { Zap, User, ArrowRight, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form handling
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (username.trim().length === 0 || password.length === 0) return;

    setIsLoading(true);

    setTimeout(() => {
        if (password === '1234') {
            onLogin(username);
        } else {
            setError('Password salah. Akses ditolak.');
            setIsLoading(false);
            setPassword('');
        }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden font-sans">
      
      {/* --- LEFT SIDE: BRANDING & VISUALS (Hidden on mobile) --- */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
            <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-fuchsia-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
            <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[80px] animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <div className="bg-indigo-500 p-1 rounded-full">
                    <Zap className="w-4 h-4 text-white" fill="currentColor" />
                </div>
                <span className="font-bold tracking-wide text-sm">TimeMaster Corp.</span>
            </div>
        </div>

        <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-black tracking-tight leading-tight mb-6">
                Manage your time, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                    Master your payroll.
                </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Platform utilitas sederhana untuk menghitung durasi kerja, estimasi gaji harian, dan mencetak slip gaji profesional secara instan.
            </p>
            
            <div className="flex gap-4">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs font-bold">
                            U{i}
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-sm font-bold text-white">1,000+ Users</span>
                    <span className="text-xs text-slate-400">Trust our utility daily</span>
                </div>
            </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} TimeMaster Utility App. Local-First Architecture.
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative">
         
         {/* Mobile Background Decoration */}
         <div className="lg:hidden absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
         
         <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white relative z-10">
            
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Selamat Datang
                </h2>
                <p className="text-slate-500 text-sm">
                    Masuk untuk mengakses workspace Anda.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Username Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wide ml-1">
                        Nama Pengguna
                    </label>
                    <div className="relative group focus-within:scale-[1.02] transition-transform">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wide ml-1">
                        Password
                    </label>
                    <div className="relative group focus-within:scale-[1.02] transition-transform">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                
                {error && (
                    <div className="flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2 border border-rose-100">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit"
                    disabled={isLoading || !username.trim() || !password}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-300 hover:bg-indigo-600 hover:shadow-indigo-300 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                           Masuk Workspace
                           <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
         </div>
      </div>
    </div>
  );
};
