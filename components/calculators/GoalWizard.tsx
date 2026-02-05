
import React, { useState, useMemo } from 'react';
import { Target, ChevronRight, ChevronLeft, Save, Sparkles, Home, GraduationCap, Plane, Heart, Briefcase, Info, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { UserProfile, FinancialGoal } from '../../types';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

type GoalCategory = FinancialGoal['category'];

const CATEGORIES: { id: GoalCategory; name: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { id: 'House', name: 'Real Estate', icon: <Home size={20}/>, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { id: 'Education', name: 'Higher Ed', icon: <GraduationCap size={20}/>, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'Retirement', name: 'Retirement', icon: <Briefcase size={20}/>, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'Travel', name: 'Experience', icon: <Plane size={20}/>, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { id: 'Other', name: 'Wealth', icon: <Heart size={20}/>, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
];

const GoalWizard: React.FC<Props> = ({ profile, onUpdateProfile }) => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<{
    category: GoalCategory;
    name: string;
    amount: number;
    years: number;
    risk: 'Conservative' | 'Moderate' | 'Aggressive';
  }>({
    category: 'Other',
    name: '',
    amount: 1000000,
    years: 5,
    risk: profile.riskAppetite || 'Moderate'
  });

  const [isSaved, setIsSaved] = useState(false);

  const stats = useMemo(() => {
    // Precise CAGR mapping based on user selection
    const rate = goal.risk === 'Aggressive' ? 12 : goal.risk === 'Moderate' ? 9 : 6;
    const months = goal.years * 12;
    const r = rate / 12 / 100;
    
    // Formula for Monthly Investment (SIP): PMT = FV / [((1 + r)^n - 1) / r]
    // Adjusted for monthly compounding at end of period
    const sipRequired = r > 0 
        ? goal.amount / (((Math.pow(1 + r, months) - 1) / r))
        : goal.amount / months;

    return {
      rate,
      sip: Math.round(sipRequired),
      totalInvested: Math.round(sipRequired * months)
    };
  }, [goal]);

  const handleSave = () => {
    const newGoal: FinancialGoal = {
      id: crypto.randomUUID(),
      name: goal.name || `${goal.category} Target`,
      targetAmount: goal.amount,
      targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + goal.years)).toISOString().split('T')[0],
      category: goal.category
    };

    onUpdateProfile({
      ...profile,
      goals: [...profile.goals, newGoal]
    });
    setIsSaved(true);
  };

  if (isSaved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-scale-in">
         <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 mb-6 shadow-glow-md">
            <ShieldCheck size={40} />
         </div>
         <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Strategy Anchored</h3>
         <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[280px] leading-relaxed mb-8 font-medium">
            Your {goal.category.toLowerCase()} target is now locked in. Personal CA will integrate this into your dashboard projections.
         </p>
         <button 
           onClick={() => { setStep(1); setIsSaved(false); setGoal({...goal, name: ''}); }}
           className="px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
         >
           Add New Milestone
         </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up pb-10">
      {/* Progress Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600">
               <Target size={22} />
            </div>
            <div>
               <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white uppercase tracking-tight">Goal Architect</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Configuration: Step {step} / 4</p>
            </div>
         </div>
         <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(s => (
               <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-6 bg-brand-500' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} />
            ))}
         </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[350px]">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
             <div className="px-2">
                <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white">Define Objective</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select the primary category for this capital goal.</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map(cat => (
                   <button 
                     key={cat.id} 
                     onClick={() => { setGoal({...goal, category: cat.id}); setStep(2); }}
                     className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all group ${goal.category === cat.id ? 'bg-white dark:bg-slate-900 border-brand-500 shadow-premium scale-[1.02]' : 'bg-slate-50 dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
                   >
                      <div className={`w-12 h-12 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                         {cat.icon}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${goal.category === cat.id ? 'text-brand-600' : 'text-slate-500'}`}>{cat.name}</span>
                   </button>
                ))}
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
             <div className="px-2">
                <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white">Quantum & Timeframe</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Determine the target amount and year of maturity.</p>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Identification Label</label>
                   <input 
                     type="text" 
                     value={goal.name} 
                     onChange={(e) => setGoal({...goal, name: e.target.value})}
                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none dark:text-white"
                     placeholder="e.g., Retirement Fund 2045"
                   />
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Corpus</label>
                      <span className="text-lg font-display font-bold text-brand-600">₹{(goal.amount / 100000).toFixed(1)}L</span>
                   </div>
                   <input 
                     type="range" 
                     min="100000" max="50000000" step="100000"
                     value={goal.amount} 
                     onChange={(e) => setGoal({...goal, amount: Number(e.target.value)})}
                     className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" 
                   />
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Years to Maturity</label>
                      <span className="text-lg font-display font-bold text-slate-900 dark:text-white">{goal.years}y</span>
                   </div>
                   <input 
                     type="range" 
                     min="1" max="40" step="1"
                     value={goal.years} 
                     onChange={(e) => setGoal({...goal, years: Number(e.target.value)})}
                     className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" 
                   />
                </div>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
             <div className="px-2">
                <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white">Risk Sensitivity</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This defines the asset allocation and expected CAGR.</p>
             </div>
             
             <div className="grid gap-3">
                {[
                  { id: 'Conservative', label: 'Conservative', desc: 'Focus: Debt & G-Secs (~6%)', icon: <ShieldCheck size={18}/>, color: 'text-blue-500' },
                  { id: 'Moderate', label: 'Moderate', desc: 'Focus: Hybrid/Index Funds (~9%)', icon: <TrendingUp size={18}/>, color: 'text-brand-500' },
                  { id: 'Aggressive', label: 'Aggressive', desc: 'Focus: Mid & Small-Cap (~12%)', icon: <Zap size={18}/>, color: 'text-amber-500' },
                ].map(r => (
                  <button 
                    key={r.id}
                    onClick={() => { setGoal({...goal, risk: r.id as any}); setStep(4); }}
                    className={`flex items-center gap-4 p-5 rounded-[1.75rem] border transition-all text-left ${goal.risk === r.id ? 'bg-white dark:bg-slate-900 border-brand-500 shadow-md translate-x-2' : 'bg-slate-50 dark:bg-slate-900 border-transparent opacity-60'}`}
                  >
                     <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm ${goal.risk === r.id ? r.color : 'text-slate-400'}`}>
                        {r.icon}
                     </div>
                     <div>
                        <h5 className="text-sm font-bold dark:text-white">{r.label}</h5>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{r.desc}</p>
                     </div>
                  </button>
                ))}
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
             <div className="px-2">
                <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white">Milestone Projection</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Strategic path to ₹{(goal.amount/100000).toFixed(1)}L.</p>
             </div>

             <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Sparkles size={120} /></div>
                <div className="relative z-10 text-center space-y-6">
                   <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Required Monthly Contribution</p>
                      <h3 className="text-5xl font-display font-bold text-brand-400 tracking-tight">₹{stats.sip.toLocaleString()}</h3>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                      <div className="text-left">
                         <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Growth via Compound</p>
                         <p className="text-lg font-bold text-emerald-400">₹{( (goal.amount - stats.totalInvested)/100000 ).toFixed(1)}L</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Inflation Impact (6%)</p>
                         <p className="text-lg font-bold text-rose-400">₹{( (goal.amount * Math.pow(1.06, goal.years) - goal.amount)/100000 ).toFixed(1)}L</p>
                      </div>
                   </div>

                   <div className="p-4 bg-white/5 rounded-2xl flex items-start gap-3 text-left">
                      <Info size={16} className="text-brand-400 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        The {goal.risk.toLowerCase()} strategy targets {stats.rate}% CAGR. This commitment assumes zero initial capital. 
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
         {step > 1 && (
           <button 
             onClick={() => setStep(prev => prev - 1)}
             className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
           >
              <ChevronLeft size={16} /> Previous
           </button>
         )}
         
         {step < 4 ? (
           <button 
             onClick={() => setStep(prev => prev + 1)}
             className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
           >
              Continue Architecture <ChevronRight size={16} />
           </button>
         ) : (
           <button 
             onClick={handleSave}
             className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-brand-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-500/20"
           >
              Establish Goal <Save size={16} />
           </button>
         )}
      </div>
    </div>
  );
};

export default GoalWizard;
