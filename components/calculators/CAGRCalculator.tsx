
import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';

interface Props { initialData?: any; }

const CAGRCalculator: React.FC<Props> = ({ initialData }) => {
  const [initialValue, setInitialValue] = useState<number>(initialData?.initial || 100000);
  const [finalValue, setFinalValue] = useState<number>(initialData?.final || 250000);
  const [years, setYears] = useState<number>(initialData?.years || 5);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
    const multiplier = finalValue / initialValue;
    setResult({
      rate: isFinite(cagr) ? cagr.toFixed(2) : 'N/A',
      multiplier: isFinite(multiplier) ? multiplier.toFixed(2) : 'N/A'
    });
  }, [initialValue, finalValue, years]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">CAGR Growth</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Compound Annual Growth Rate</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BarChart2 size={20} />
         </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Initial Value</label>
              <input type="number" value={initialValue} onChange={(e) => setInitialValue(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Final Value</label>
              <input type="number" value={finalValue} onChange={(e) => setFinalValue(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
           </div>
        </div>
        <div>
           <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Duration (Years)</label>
           <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
        </div>
      </div>

      {result && (
        <div className="bg-slate-900 dark:bg-slate-950 border dark:border-slate-800 rounded-2xl p-6 text-white shadow-xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-brand-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Growth Rate (CAGR)</p>
            <h4 className="text-5xl font-display font-bold text-white mb-6">{result.rate}%</h4>
            <div className="h-px bg-white/10 dark:bg-white/5 mb-4" />
            <div className="flex items-center gap-2 text-sm">
               <TrendingUp size={16} className="text-emerald-400" />
               <span className="opacity-70">Investment grew by</span>
               <span className="font-bold text-emerald-400">{result.multiplier}x</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CAGRCalculator;
