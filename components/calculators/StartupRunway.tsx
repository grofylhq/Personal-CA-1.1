
import React, { useState, useEffect } from 'react';
import { Activity, Flame, Zap, Target } from 'lucide-react';

interface Props { initialData?: any; }

const StartupRunway: React.FC<Props> = ({ initialData }) => {
  const [cash, setCash] = useState<number>(initialData?.cash || 5000000);
  const [revenue, setRevenue] = useState<number>(initialData?.revenue || 200000);
  const [fixedExpenses, setFixedExpenses] = useState<number>(400000);
  const [variableExpenses, setVariableExpenses] = useState<number>(initialData?.expenses - 400000 || 200000);
  
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const totalExpenses = fixedExpenses + variableExpenses;
    const netBurn = Math.max(0, totalExpenses - revenue);
    const runway = netBurn > 0 ? cash / netBurn : Infinity;
    
    setResult({
      burn: netBurn,
      totalExpenses,
      runway: isFinite(runway) ? Math.floor(runway) : 'Infinite',
      status: runway < 6 ? 'Critical' : runway < 12 ? 'Fair' : 'Healthy'
    });
  }, [cash, revenue, fixedExpenses, variableExpenses]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Runway Analyst</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Burn & Survivability metrics</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Flame size={20} />
         </div>
      </div>

      <div className="space-y-5">
        <div>
           <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-1">Total Cash Reserve</label>
           <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number" value={cash} 
                onChange={(e) => setCash(Number(e.target.value))} 
                className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-display font-bold outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white" 
              />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-1">Monthly Recurring Revenue (MRR)</label>
              <input type="number" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-display font-bold outline-none dark:text-white" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-1">Fixed Burn (Rent/Salary)</label>
              <input type="number" value={fixedExpenses} onChange={(e) => setFixedExpenses(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-display font-bold outline-none dark:text-white" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-1">Variable Burn (Ads/Dev)</label>
              <input type="number" value={variableExpenses} onChange={(e) => setVariableExpenses(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-display font-bold outline-none dark:text-white" />
           </div>
        </div>
      </div>

      {result && (
        <div className={`rounded-3xl p-6 text-white shadow-xl relative overflow-hidden transition-colors duration-500 ${result.status === 'Critical' ? 'bg-rose-900 border dark:border-rose-700' : result.status === 'Fair' ? 'bg-amber-900 border dark:border-amber-700' : 'bg-slate-900 dark:bg-slate-950 border dark:border-slate-800'}`}>
           <div className="absolute right-0 top-0 p-6 opacity-5 rotate-12"><Activity size={120} /></div>
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">Survival Estimate</p>
                    <h4 className="text-4xl font-display font-bold leading-none">{result.runway} <span className="text-base font-medium opacity-50 uppercase tracking-tighter">Months</span></h4>
                 </div>
                 <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${result.status === 'Critical' ? 'bg-rose-500/30' : result.status === 'Fair' ? 'bg-amber-500/30' : 'bg-emerald-500/30'}`}>
                   <Target size={12} /> {result.status}
                 </div>
              </div>
              
              <div className="h-px bg-white/10 dark:bg-white/5 mb-4" />
              
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs">
                    <span className="opacity-50">Monthly Net Burn</span>
                    <span className="font-bold">₹{result.burn.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="opacity-50">Cash Efficiency Ratio</span>
                    <span className="font-bold text-emerald-400">{revenue > 0 ? (revenue / result.totalExpenses).toFixed(2) : '0.00'}</span>
                 </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold bg-white/10 dark:bg-white/5 p-3 rounded-xl border border-white/5">
                 <Zap size={14} className="text-amber-400" />
                 <span>{typeof result.runway === 'number' ? `REDUCE VARIABLE BURN BY 20% TO ADD ${Math.round(result.runway * 1.25) - result.runway} MONTHS` : 'RUNWAY IS INFINITE, NO NEED TO REDUCE BURN'}</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StartupRunway;
