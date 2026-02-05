
import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, Lock, Calendar } from 'lucide-react';

interface Props { initialData?: any; }

const ELSSCalculator: React.FC<Props> = ({ initialData }) => {
  const [investment, setInvestment] = useState<number>(initialData?.amount || 50000);
  const [taxBracket, setTaxBracket] = useState<number>(30);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const taxSaved = (investment * taxBracket) / 100;
    const netCost = investment - taxSaved;
    
    setResult({
      taxSaved,
      netCost,
      lockIn: 3 // Fixed for ELSS
    });
  }, [investment, taxBracket]);

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">ELSS Tax Saver</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Section 80C Equity Advantage</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={20} />
         </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-1">
           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Investment Amount</label>
           <input type="number" value={investment} onChange={(e) => setInvestment(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm outline-none dark:text-white" />
           <p className="text-[9px] text-slate-400 mt-1 px-1">* Maximum benefit capped at ₹1,50,000 under Section 80C.</p>
        </div>

        <div className="space-y-1">
           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Your Tax Bracket (%)</label>
           <div className="grid grid-cols-3 gap-2">
              {[10, 20, 30].map(v => (
                <button key={v} onClick={() => setTaxBracket(v)} className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${taxBracket === v ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'}`}>
                  {v}% Slab
                </button>
              ))}
           </div>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
           <div className="p-6 bg-slate-900 dark:bg-slate-950 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><ShieldCheck size={80} /></div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Immediate Tax Saved</p>
              <h4 className="text-4xl font-display font-bold text-emerald-400 mb-6">₹{result.taxSaved.toLocaleString()}</h4>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 dark:border-slate-800">
                 <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-brand-400 shrink-0" />
                    <div>
                       <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Lock-in Period</p>
                       <p className="text-sm font-bold">3 Years (Shortest)</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-2">
                    <TrendingUp size={14} className="text-brand-400 shrink-0" />
                    <div>
                       <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Net Outflow</p>
                       <p className="text-sm font-bold">₹{result.netCost.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3">
              <Lock size={16} className="text-brand-500 shrink-0" />
              <div className="text-[11px] text-slate-500">
                 <span className="font-bold text-slate-700 dark:text-slate-300">Strategy Comparison:</span> ELSS has a 3-year lock-in, compared to 5 years for Tax Saver FDs and 15 years for PPF.
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ELSSCalculator;
