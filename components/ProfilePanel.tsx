
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, DocumentItem, AIProvider } from '../types';
import { AI_MODELS, DEFAULT_MODELS } from '../constants';
import { 
  X, Wallet, TrendingUp, Shield, Save, 
  Sparkles, Building2, 
  Lock, Upload, MessageSquare, BrainCircuit, Clock, File as FileIcon,
  Settings, Moon, Sun, CreditCard, CheckCircle2,
  Trash2, Landmark, Smartphone, FileText, LogOut, BellRing,
  Fingerprint, ShieldCheck, Database, Zap, ArrowRight, Activity, ShieldAlert,
  Cpu, Globe, ShieldHalf, LayoutGrid, Eye, Search, AlertCircle, ChevronRight,
  User, Camera, Phone, Mail, UserCog, Briefcase, MapPin, Factory, Plus, Bot
} from 'lucide-react';
import { Logo } from './Logo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onLogout?: () => void;
}

const ProfilePanel: React.FC<Props> = ({ isOpen, onClose, profile, onUpdate, theme, onToggleTheme, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'finance' | 'intelligence' | 'vault' | 'bank' | 'settings'>('personal');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [deadlinesOn, setDeadlinesOn] = useState(true);
  const [intelOn, setIntelOn] = useState(true);

  const handleChange = (path: string, value: any) => {
    const forbiddenKeys = ['__proto__', 'constructor', 'prototype'];
    if (forbiddenKeys.some(key => path.includes(key))) return;

    const newProfile: UserProfile = JSON.parse(JSON.stringify(profile));
    const keys = path.split('.');
    let current: any = newProfile;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onUpdate(newProfile);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newDocs: DocumentItem[] = Array.from(files).map((file: File) => {
      let type = 'Other';
      const nameLower = file.name.toLowerCase();
      if (nameLower.includes('pan')) type = 'Tax ID';
      else if (nameLower.includes('gst')) type = 'Business Reg';
      else if (nameLower.includes('it-') || nameLower.includes('income')) type = 'Tax Return';
      else if (nameLower.includes('statement')) type = 'Banking';

      return {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: type,
        uploadDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Pending'
      };
    });

    handleChange('documents', [...profile.documents, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('avatarUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (id: string) => {
    handleChange('documents', profile.documents.filter(d => d.id !== id));
  };


  const handleModelSelect = (provider: AIProvider, modelId: string) => {
    const newProfile: UserProfile = JSON.parse(JSON.stringify(profile));
    newProfile.preferredAIProvider = provider;
    newProfile.preferredModel = modelId;
    onUpdate(newProfile);
  };

  const handlePurge = () => {
    if (confirm("CRITICAL: This will permanently wipe all local session logs and financial profile cache. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const totalAssets = (Object.values(profile.assets) as number[]).reduce((a, b) => a + b, 0);
  const totalLiabilities = (Object.values(profile.liabilities) as number[]).reduce((a, b) => a + b, 0);
  const netWorth = totalAssets - totalLiabilities;
  const savings = profile.monthlyIncome - profile.monthlyExpenses;
  const savingsRate = profile.monthlyIncome > 0 ? Math.round((savings / profile.monthlyIncome) * 100) : 0;

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 bg-slate-200/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />

      <div 
        className={`relative w-full h-full md:h-[90vh] md:w-[90vw] md:max-w-6xl bg-white dark:bg-[#080808] md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-20 scale-95 opacity-0'}`}
      >
        <div className="flex h-full flex-col md:flex-row">
          {/* Responsive Sidebar / Top Nav */}
          <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 flex flex-col bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-0 overflow-hidden shrink-0 h-auto md:h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-0 md:mb-10 px-2 shrink-0">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={onClose}>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Logo size={32} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-slate-900 dark:text-white text-sm tracking-tight uppercase">Identity</h2>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Core V2.0</p>
                  </div>
                </div>
                {/* Mobile Close Button */}
                <button onClick={onClose} className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                   <X size={18} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden custom-scrollbar pb-2 md:pb-0 md:pr-1 md:flex-1 no-scrollbar md:space-y-2">
                <NavButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} icon={<UserCog size={16} />} label="Personal" />
                <NavButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Wallet size={16} />} label="Balance" />
                <NavButton active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} icon={<BrainCircuit size={16} />} label="Memory" />
                <NavButton active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon={<Shield size={16} />} label="Vault" />
                <NavButton active={activeTab === 'bank'} onClick={() => setActiveTab('bank')} icon={<Landmark size={16} />} label="Banking" />
                <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={16} />} label="System" />
              </nav>

              {/* Desktop Footer Actions */}
              <div className="hidden md:block mt-auto pt-6 space-y-3 shrink-0">
                 {onLogout && (
                   <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 transition-all">
                      <LogOut size={14} /> Sign Out
                   </button>
                 )}
                 <button onClick={onClose} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black font-display font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl border border-slate-100">
                    <Save size={14} /> SAVE PROFILE
                 </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0a0a0a] overflow-hidden relative">
             <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
                <div className="max-w-4xl mx-auto p-5 md:p-10 pb-32 md:pb-20">
                   
                   {activeTab === 'personal' && (
                     <div className="space-y-10 animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                           <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                              <div className="absolute -inset-1 bg-gradient-to-tr from-brand-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                 {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Profile" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-850 p-6">
                                      <Logo size={64} className="opacity-80" />
                                    </div>
                                 )}
                                 <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white mb-1" />
                                    <span className="text-[8px] text-white font-bold uppercase tracking-widest">Update</span>
                                 </div>
                              </div>
                              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                           </div>
                           
                           <div className="flex-1 space-y-2 text-center md:text-left">
                              <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{profile.name}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{profile.designation || 'Strategic Investor'}</p>
                              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                                 <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200/50 dark:border-white/5 flex items-center gap-1.5">
                                    <Mail size={10}/> {profile.email}
                                 </span>
                                 {profile.phoneNumber && (
                                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200/50 dark:border-white/5 flex items-center gap-1.5">
                                       <Phone size={10}/> {profile.phoneNumber}
                                    </span>
                                 )}
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Entity Identity</label>
                              <div className="space-y-3">
                                 <IdentityInput 
                                    label="Legal Name" 
                                    value={profile.name} 
                                    onChange={(v: string) => handleChange('name', v)} 
                                    icon={<User size={16}/>} 
                                    placeholder="Enter your name"
                                 />
                                 <IdentityInput 
                                    label="Professional Role" 
                                    value={profile.designation || ''} 
                                    onChange={(v: string) => handleChange('designation', v)} 
                                    icon={<Briefcase size={16}/>} 
                                    placeholder="e.g. Managing Director"
                                 />
                                 <IdentityInput 
                                    label="Company Name" 
                                    value={profile.companyName || ''} 
                                    onChange={(v: string) => handleChange('companyName', v)} 
                                    icon={<Building2 size={16}/>} 
                                    placeholder="Legal Entity Name"
                                 />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Connectivity & Sector</label>
                              <div className="space-y-3">
                                 <IdentityInput 
                                    label="Verified Email" 
                                    value={profile.email} 
                                    onChange={(v: string) => handleChange('email', v)} 
                                    icon={<Mail size={16}/>} 
                                    placeholder="email@domain.com"
                                    disabled={true}
                                 />
                                 <IdentityInput 
                                    label="Contact Number" 
                                    value={profile.phoneNumber || ''} 
                                    onChange={(v: string) => handleChange('phoneNumber', v)} 
                                    icon={<Phone size={16}/>} 
                                    placeholder="+91 XXXXX XXXXX"
                                 />
                                 <IdentityInput 
                                    label="Industry Type" 
                                    value={profile.industryType || ''} 
                                    onChange={(v: string) => handleChange('industryType', v)} 
                                    icon={<Factory size={16}/>} 
                                    placeholder="e.g. Technology, Manufacturing"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Statutory Domicile</label>
                           <IdentityInput 
                              label="Business Address" 
                              value={profile.businessAddress || ''} 
                              onChange={(v: string) => handleChange('businessAddress', v)} 
                              icon={<MapPin size={16}/>} 
                              placeholder="Registered Office / Corporate Address"
                           />
                        </div>

                        <div className="p-6 bg-brand-50/50 dark:bg-brand-900/10 rounded-[2rem] border border-brand-100 dark:border-brand-500/20 flex items-start gap-4">
                           <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                              <ShieldCheck size={20}/>
                           </div>
                           <div>
                              <h4 className="font-bold text-brand-900 dark:text-brand-100 text-sm">Identity Verification</h4>
                              <p className="text-xs text-brand-700 dark:text-brand-300/70 mt-0.5 leading-relaxed">Your professional credentials and business domicile are used to personalize statutory documents and compliance drafting. These fields are encrypted at rest.</p>
                           </div>
                        </div>
                     </div>
                   )}

                   {activeTab === 'finance' && (
                     <div className="space-y-8 animate-fade-in">
                        <div className="relative group overflow-hidden rounded-[2rem] bg-slate-900 dark:bg-black border border-slate-100 dark:border-white/10 p-8 text-white shadow-xl">
                           <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 pointer-events-none">
                              <Activity size={200} />
                           </div>
                           <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                              <div className="space-y-4">
                                 <div className="flex gap-2">
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest border border-white/5">Consolidated</span>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Live</span>
                                 </div>
                                 <div>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Net Worth</p>
                                    <h3 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
                                       ₹{(netWorth / 100000).toFixed(2)}<span className="text-2xl md:text-3xl text-slate-500 ml-1">L</span>
                                    </h3>
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10 min-w-[100px]">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Savings Rate</span>
                                    <span className="text-2xl font-display font-bold text-emerald-400">{savingsRate}%</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <CompactInput label="Monthly Income" value={profile.monthlyIncome} onChange={(v: number) => handleChange('monthlyIncome', v)} icon={<Smartphone size={18}/>} />
                           <CompactInput label="Monthly Burn" value={profile.monthlyExpenses} onChange={(v: number) => handleChange('monthlyExpenses', v)} icon={<Activity size={18}/>} />
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest px-2">Asset Allocation</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <CompactInput label="Cash" value={profile.assets.cash} onChange={(v: number) => handleChange('assets.cash', v)} icon={<Building2 size={16}/>} />
                              <CompactInput label="Equity" value={profile.assets.equity} onChange={(v: number) => handleChange('assets.equity', v)} icon={<TrendingUp size={16}/>} />
                              <CompactInput label="Gold" value={profile.assets.gold} onChange={(v: number) => handleChange('assets.gold', v)} icon={<Sparkles size={16}/>} />
                           </div>
                        </div>
                     </div>
                   )}

                   {activeTab === 'intelligence' && (
                     <div className="space-y-8 animate-fade-in">
                        <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
                           <div className="relative z-10">
                              <div className="flex items-center gap-4 mb-6">
                                 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-brand-400 border border-white/10"><BrainCircuit size={24}/></div>
                                 <div>
                                    <h3 className="text-2xl font-display font-bold tracking-tight">Memory Core</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Context Buffer</p>
                                 </div>
                              </div>
                              <textarea 
                                 value={profile.memoryBank}
                                 onChange={(e) => handleChange('memoryBank', e.target.value)}
                                 className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm leading-relaxed text-slate-200 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none h-[300px] custom-scrollbar font-mono placeholder:text-slate-700 shadow-inner"
                                 placeholder="// Input entity structure, GSTIN details, family dependencies..."
                              />
                           </div>
                        </div>
                     </div>
                   )}

                   {activeTab === 'vault' && (
                     <div className="space-y-8 animate-fade-in">
                        <div className="flex items-center justify-between p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-500/20">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Shield size={24}/></div>
                              <div>
                                 <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg">Secure Vault</h3>
                                 <p className="text-xs text-indigo-600 dark:text-indigo-300/70">Local Document Residency</p>
                              </div>
                           </div>
                           <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-lg">
                              <Upload size={14} /> Upload
                           </button>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {profile.documents.map(doc => (
                              <div key={doc.id} className="p-5 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl flex flex-col justify-between h-32">
                                 <div className="flex justify-between items-start">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400"><FileText size={16}/></div>
                                    <button onClick={() => removeDocument(doc.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                                 </div>
                                 <div>
                                    <h5 className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate mb-1">{doc.name}</h5>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${doc.status === 'Verified' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{doc.status}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {activeTab === 'bank' && (
                     <div className="space-y-8 animate-fade-in">
                        <div className="bg-slate-900 dark:bg-[#050505] rounded-[2rem] p-8 text-white relative border border-slate-800 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-brand-400"><Cpu size={24}/></div>
                              <div>
                                 <h3 className="text-xl font-bold">Account Aggregation</h3>
                                 <p className="text-xs text-slate-400 mt-1">Read-only Pipelines</p>
                              </div>
                           </div>
                           <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg">
                              <Plus size={14}/> Integrate
                           </button>
                        </div>
                        <div className="space-y-4">
                           {profile.linkedAccounts.length > 0 ? profile.linkedAccounts.map((acc, i) => (
                              <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold">{acc.bankName[0]}</div>
                                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">{acc.bankName}</h5>
                                 </div>
                                 <p className="text-[10px] text-emerald-500 font-bold uppercase"><CheckCircle2 size={10} className="inline mr-1"/> Active</p>
                              </div>
                           )) : (
                             <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2rem]">
                               <p className="text-slate-400 font-medium text-sm">No linked statutory nodes found.</p>
                             </div>
                           )}
                        </div>
                     </div>
                   )}

                   {activeTab === 'settings' && (
                     <div className="space-y-12 animate-fade-in">
                        <section className="space-y-4">
                           <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest px-2">Appearance</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-black flex items-center justify-center text-slate-500 border border-slate-100 dark:border-white/10">
                                       {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                    </div>
                                    <div>
                                       <h5 className="font-bold text-slate-900 dark:text-white text-sm">Theme</h5>
                                       <p className="text-[10px] text-slate-500 uppercase">{theme === 'dark' ? 'OLED Dark' : 'Standard Light'}</p>
                                    </div>
                                 </div>
                                 <button onClick={onToggleTheme} className={`w-12 h-7 rounded-full p-1 transition-all ${theme === 'dark' ? 'bg-brand-600' : 'bg-slate-200'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                                 </button>
                              </div>
                           </div>
                        </section>

                        <section className="space-y-4">
                           <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest px-2 flex items-center gap-2">
                             <Cpu size={14}/> AI Model
                           </h4>
                           <div className="space-y-3">
                             {(['gemini', 'openai', 'anthropic', 'openrouter', 'puter'] as AIProvider[]).map(providerKey => {
                               const providerModels = AI_MODELS.filter(m => m.provider === providerKey);
                               const providerLabel = providerKey === 'gemini' ? 'Google Gemini' : providerKey === 'openai' ? 'OpenAI' : providerKey === 'anthropic' ? 'Anthropic Claude' : providerKey === 'openrouter' ? 'OpenRouter' : 'Puter.js';
                               const selectedModel = profile.preferredModel || DEFAULT_MODELS[profile.preferredAIProvider || 'gemini'];
                               return (
                                 <div key={providerKey} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden">
                                   <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                                     <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{providerLabel}</p>
                                   </div>
                                   <div className="p-2 space-y-1">
                                     {providerModels.map(m => {
                                       const isSelected = selectedModel === m.id;
                                       return (
                                         <button
                                           key={m.id}
                                           onClick={() => handleModelSelect(m.provider, m.id)}
                                           className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                                             isSelected
                                               ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700 ring-1 ring-brand-500/20'
                                               : 'hover:bg-white dark:hover:bg-white/5 border border-transparent'
                                           }`}
                                         >
                                           <div>
                                             <p className={`text-sm font-bold ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-white'}`}>{m.name}</p>
                                             <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{m.description}</p>
                                           </div>
                                           {isSelected && (
                                             <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                                               <CheckCircle2 size={12} className="text-white" />
                                             </div>
                                           )}
                                         </button>
                                       );
                                     })}
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                        </section>

                        <section className="space-y-4">
                           <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest px-2">Communications</h4>
                           <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl overflow-hidden">
                              <SettingToggle title="Statutory Deadlines" desc="GST, Income Tax, ROC Alerts" active={deadlinesOn} onToggle={() => setDeadlinesOn(!deadlinesOn)} />
                              <SettingToggle title="Market Intelligence" desc="Daily economic briefing" active={intelOn} onToggle={() => setIntelOn(!intelOn)} />
                           </div>
                        </section>

                        <section className="space-y-4">
                           <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest px-2 text-rose-500 flex items-center gap-2">
                             <ShieldAlert size={14}/> Data Security
                           </h4>
                           <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center text-rose-500"><AlertCircle size={20}/></div>
                                 <div>
                                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">Purge Identity</h5>
                                    <p className="text-xs text-slate-500">Wipe local session logs and financial profile cache.</p>
                                 </div>
                              </div>
                              <button onClick={handlePurge} className="px-5 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-rose-500 text-xs font-bold uppercase tracking-wider hover:bg-rose-50 transition-all">
                                 Purge All
                              </button>
                           </div>
                        </section>
                     </div>
                   )}

                   {/* Mobile Footer Actions */}
                   <div className="md:hidden mt-8 space-y-3 pt-8 border-t border-slate-100 dark:border-white/5">
                      <button onClick={onClose} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-display font-bold text-[10px] uppercase tracking-widest shadow-xl">
                        <Save size={14} /> SAVE PROFILE
                     </button>
                     {onLogout && (
                       <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                          <LogOut size={14} /> Sign Out
                       </button>
                     )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 group shrink-0 whitespace-nowrap ${
      active 
        ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'
    }`}
  >
    <div className={`${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`}>
       {icon}
    </div>
    <span className="uppercase tracking-wider">{label}</span>
    {active && <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-brand-500"></div>}
  </button>
);

const SettingToggle = ({ title, desc, active = false, onToggle }: any) => (
  <div 
    onClick={onToggle}
    className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between gap-4 last:border-0 hover:bg-white dark:hover:bg-white/5 transition-colors cursor-pointer group"
  >
     <div>
        <p className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{desc}</p>
     </div>
     <div className={`w-10 h-6 rounded-full p-1 transition-all ${active ? 'bg-emerald-500 shadow-glow-sm' : 'bg-slate-200 dark:bg-slate-700'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
     </div>
  </div>
);

const CompactInput = ({ label, value, onChange, icon }: any) => (
  <div className="group relative bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
     <div className="flex justify-between items-center mb-1">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
        <div className="text-slate-300 dark:text-slate-700 group-focus-within:text-brand-500 transition-colors scale-75 origin-right">{icon}</div>
     </div>
     <div className="flex items-baseline gap-1">
        <span className="text-lg text-slate-300 dark:text-slate-700 font-bold select-none">₹</span>
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(Number(e.target.value) || 0)} 
          className="w-full bg-transparent border-none p-0 text-2xl font-display font-bold text-slate-900 dark:text-white focus:ring-0 placeholder-slate-200" 
        />
     </div>
  </div>
);

const IdentityInput = ({ label, value, onChange, icon, placeholder, disabled = false }: any) => (
  <div className={`group bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5 transition-all ${disabled ? 'opacity-70' : 'hover:border-slate-300 dark:hover:border-slate-700 focus-within:ring-1 focus-within:ring-brand-500 focus-within:border-brand-500'}`}>
     <div className="flex justify-between items-center mb-1.5">
        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em]">{label}</label>
        <div className="text-slate-300 dark:text-slate-700 group-focus-within:text-brand-500 transition-colors">{icon}</div>
     </div>
     <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-800"
     />
  </div>
);

export default ProfilePanel;
