import React, { useState } from 'react';
import { Zap, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Moon, Sun, Globe } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form handling
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Simple validation for Demo
      if (username.length > 0 && password === '1234') {
        onLogin(username);
      } else {
        setError('Kredensial tidak valid. (Gunakan Password: 1234)');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      
      {/* --- LEFT SIDE: BRANDING & VISUALS (Hidden on mobile) --- */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 dark:bg-black relative flex-col justify-between p-12 text-white overflow-hidden transition-colors duration-300">
        
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
            &copy; 2024 TimeMaster Utility App. Local-First Architecture.
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 relative transition-colors duration-300">
         
         {/* Top Controls */}
         <div className="absolute top-8 right-8 flex gap-2">
             <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
             </button>
             <button onClick={() => setLanguage(language === 'id' ? 'en' : 'id')} className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs w-8 h-8 flex items-center justify-center">
                {language.toUpperCase()}
             </button>
         </div>

         {/* Mobile Background Decoration */}
         <div className="lg:hidden absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-200 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-50"></div>
         
         <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 relative z-10 transition-colors duration-300">
            
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors">
                    {isLoginMode ? t('welcome_back') : t('create_account')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                    {isLoginMode ? t('enter_details') : t('get_started')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Username Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wide ml-1 transition-colors">
                        {t('username_label')}
                    </label>
                    <div className="relative group transition-all duration-300 focus-within:scale-[1.02]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. johndoe"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wide transition-colors">
                            {t('password_label')}
                        </label>
                    </div>
                    <div className="relative group transition-all duration-300 focus-within:scale-[1.02]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Additional Register Fields (Visual Only) */}
                {!isLoginMode && (
                     <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-start gap-3 border border-emerald-100 dark:border-emerald-800 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-emerald-800 dark:text-emerald-200">
                            <p className="font-bold">Local Account</p>
                            <p>Data will be stored securely in your browser.</p>
                        </div>
                     </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center gap-3 border border-rose-100 dark:border-rose-800 animate-in shake">
                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-200">{error}</span>
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-300 dark:shadow-indigo-900/40 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:shadow-indigo-300 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                           {isLoginMode ? t('sign_in') : t('create_account')} 
                           <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
            
            {/* Toggle Mode */}
            <div className="mt-8 text-center">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">
                    {isLoginMode ? t('dont_have_account') : t('already_have_account')}
                    <button 
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError('');
                            setUsername('');
                            setPassword('');
                        }}
                        className="ml-2 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline decoration-2 underline-offset-4 transition-colors"
                    >
                        {isLoginMode ? t('sign_up_free') : t('log_in_link')}
                    </button>
                </p>
            </div>

            {/* Demo Hint */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                 <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600 transition-colors">
                    {t('demo_password')}
                 </span>
            </div>

         </div>
      </div>
    </div>
  );
};