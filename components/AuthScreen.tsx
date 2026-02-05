
import React, { useState, useEffect } from 'react';
import { UserAccount, UserProfile } from '../types';
import { authAPI } from '../services/database';
import { 
  Shield, Mail, Lock, ArrowRight, UserPlus, 
  Fingerprint, ShieldCheck, Zap, Globe, Eye, EyeOff, Loader2,
  AlertCircle, Activity, CheckCircle2, Hexagon
} from 'lucide-react';
import { Logo } from './Logo';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

interface AuthScreenProps {
  onLogin: (account: UserAccount) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);

  useEffect(() => {
    setError('');
    setVerificationStep(0);
  }, [isLogin]);

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const user = await authAPI.loginWithGoogle();
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Google Authentication Failed');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Security: Input Validation
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    
    if (!cleanEmail || !password) {
       setError('All fields are required.');
       return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
       setError('Please enter a valid email address.');
       return;
    }
    
    if (!isLogin && password.length < 8) {
       setError('Password must be at least 8 characters for security.');
       return;
    }
    
    if (!isLogin && !cleanName) {
       setError('Entity Name is required for registration.');
       return;
    }

    setIsLoading(true);
    setVerificationStep(1);

    // Visual effect: Simulate verification steps
    const stepInterval = setInterval(() => {
       setVerificationStep(prev => {
          if (prev < 3) return prev + 1;
          clearInterval(stepInterval);
          return prev;
       });
    }, 500);

    try {
      let user: UserAccount;
      
      if (isLogin) {
        user = await authAPI.login(cleanEmail, password);
      } else {
        user = await authAPI.register(cleanEmail, password, cleanName);
      }

      // Success
      clearInterval(stepInterval);
      setVerificationStep(3);
      setTimeout(() => {
        onLogin(user);
      }, 500);

    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || 'Authentication Failed');
      setIsLoading(false);
      setVerificationStep(0);
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-[#050505] flex flex-col md:flex-row font-sans text-slate-900 dark:text-white">
      {/* Visual Narrative Side (Desktop Only) - Fixed Height, No Scroll */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-slate-900 flex-col justify-between p-12 lg:p-20 overflow-hidden border-r border-white/5 relative shrink-0 h-full">
         {/* Dynamic Background */}
         <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.15),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.15),transparent_50%)]"></div>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            {/* Animated Elements */}
            <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent animate-pulse"></div>
            <div className="absolute bottom-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
         </div>

         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
               <div className="relative group">
                  <div className="absolute inset-0 bg-brand-400/20 blur-xl rounded-full group-hover:bg-brand-400/40 transition-all duration-500"></div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-xl relative z-10">
                     <Logo size={28} />
                  </div>
               </div>
               <div>
                  <span className="text-white font-display font-bold tracking-tight text-xl block">Personal CA</span>
                  <span className="text-brand-400 text-[9px] uppercase tracking-widest bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20 font-bold">V2.0 Core</span>
               </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-display font-black text-white tracking-tighter leading-[1.1] mb-8">
               Autonomous <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-white to-indigo-300">Intelligence</span> <br/>
               for Finance.
            </h1>
            
            <p className="text-base lg:text-lg text-slate-400 font-medium leading-relaxed max-w-sm border-l-2 border-brand-500 pl-6">
               Professional architecture for tax optimization, statutory compliance, and wealth forecasting.
            </p>
         </div>

         <div className="relative z-10 grid grid-cols-2 gap-4 mt-12">
            <StatCard value="₹450Cr+" label="Assets Analyzed" icon={<Activity size={14}/>} />
            <StatCard value="99.9%" label="Accuracy Rate" icon={<ShieldCheck size={14}/>} />
         </div>
      </div>

      {/* Auth Interface Side - Scrollable */}
      <div className="flex-1 h-full overflow-y-auto overflow-x-hidden flex flex-col items-center p-6 md:p-12 relative z-10 bg-white/50 dark:bg-black/50 backdrop-blur-xl">
         <div className="w-full max-w-[380px] animate-fade-in py-8 my-auto">
            {/* Mobile Header / Logo */}
            <div className="md:hidden flex flex-col items-center justify-center mb-10 mt-2">
               <div className="relative group mb-4">
                  <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full"></div>
                  <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex items-center justify-center border border-slate-100 dark:border-white/5 relative z-10">
                     <Logo size={40} />
                  </div>
               </div>
               <div className="text-center">
                  <h2 className="font-display font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase leading-none">Personal CA</h2>
                  <p className="text-[9px] text-brand-500 font-bold uppercase tracking-[0.3em] mt-1.5 ml-1">Financial Intelligence</p>
               </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
               {/* Mode Switcher */}
               <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl mb-6 relative">
                  <div 
                     className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-800 rounded-xl shadow-sm transition-all duration-300 ease-spring ${isLogin ? 'left-1.5' : 'left-[calc(50%+4.5px)]'}`}
                  ></div>
                  <button 
                     onClick={() => !isLoading && !isGoogleLoading && setIsLogin(true)}
                     className={`flex-1 relative z-10 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${isLogin ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
                  >
                     Establish Link
                  </button>
                  <button 
                     onClick={() => !isLoading && !isGoogleLoading && setIsLogin(false)}
                     className={`flex-1 relative z-10 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${!isLogin ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
                  >
                     Initialize
                  </button>
               </div>

               <div className="mb-6 text-center">
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                     {isLogin ? 'Welcome back.' : 'Deploy Identity.'}
                  </h3>
               </div>

               <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] mb-6 disabled:opacity-50"
               >
                  {isGoogleLoading ? (
                     <Loader2 size={16} className="animate-spin text-brand-500" />
                  ) : (
                     <GoogleIcon />
                  )}
                  <span>Continue with Google</span>
               </button>

               <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-white/5"></div></div>
                  <span className="relative z-10 px-4 bg-white dark:bg-[#0a0a0a] text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Or use Credentials</span>
               </div>

               <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                     <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
                        <div className="relative group">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors z-10"><UserPlus size={16} /></div>
                           <input 
                              type="text" 
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full h-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                              placeholder="Legal Name"
                              disabled={isLoading || isGoogleLoading}
                              autoComplete="name"
                           />
                        </div>
                     </div>
                  )}

                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Communication Node</label>
                     <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors z-10"><Mail size={16} /></div>
                        <input 
                           type="email" 
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full h-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                           placeholder="name@node.com"
                           required
                           disabled={isLoading || isGoogleLoading}
                           autoComplete="email"
                        />
                     </div>
                  </div>

                  <div className="space-y-1">
                     <div className="flex justify-between items-center ml-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Access Key</label>
                     </div>
                     <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors z-10"><Lock size={16} /></div>
                        <input 
                           type={showPassword ? 'text' : 'password'}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full h-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-11 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                           placeholder="••••••••"
                           required
                           disabled={isLoading || isGoogleLoading}
                           autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                        <button 
                           type="button" 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                           disabled={isLoading || isGoogleLoading}
                        >
                           {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>
                  </div>

                  {error && (
                     <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400 text-[11px] font-bold animate-slide-up">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                     </div>
                  )}

                  <button 
                     disabled={isLoading || isGoogleLoading}
                     className="w-full h-12 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 text-white dark:text-black font-display font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-brand-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-80 disabled:cursor-wait group relative overflow-hidden mt-4"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                     {isLoading ? (
                        <div className="flex items-center gap-2.5 relative z-10">
                           <Loader2 size={16} className="animate-spin" />
                           <span>Verifying</span>
                        </div>
                     ) : (
                        <span className="flex items-center gap-2.5 relative z-10">
                           {isLogin ? 'Access Core' : 'Deploy Identity'}
                           <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                     )}
                  </button>
               </form>

               <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                  <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4 text-opacity-60">Verified Credentials</p>
                  <div className="grid grid-cols-2 gap-3">
                     <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-bold text-[9px] uppercase tracking-wider transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                        <Fingerprint size={14} /> Biometric
                     </button>
                     <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-bold text-[9px] uppercase tracking-wider transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                        <Hexagon size={14} /> Key Vault
                     </button>
                  </div>
               </div>
            </div>
            
            <div className="mt-8 text-center flex flex-col items-center gap-4">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-widest border border-emerald-500/10">
                  <ShieldCheck size={12} /> Secure Protocol Active
               </div>
               <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed">
                  Encryption standards compliant with ISO/IEC 27001 financial services framework.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ value, label, icon }: any) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default">
     <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 shadow-sm">
        {icon}
     </div>
     <div>
        <h4 className="text-lg font-display font-bold text-white leading-none mb-0.5">{value}</h4>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
     </div>
  </div>
);

export default AuthScreen;
