
import React, { useState, useEffect } from 'react';
import { Landmark, PieChart, Info } from 'lucide-react';

interface Props { initialData?: any; }

const FDCalculator: React.FC<Props> = ({ initialData }) => {
  const [principal, setPrincipal] = useState<number>(initialData?.amount || 100000);
  const [rate, setRate] = useState<number>(initialData?.rate || 7);
  const [years, setYears] = useState<number>(initialData?.years || 1);
  const [compounding, setCompounding] = useState<number>(4); // Quarterly

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // A = P(1 + r/n)^(nt)
    const n = compounding;
    const r = rate / 100;
    const t = years;
    const amount = principal * Math.pow(1 + r/n, n * t);
    
    setResult({
      maturity: Math.round(amount),
      interest: Math.round(amount - principal)
    });
  }, [principal, rate, years, compounding]);

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Fixed Deposit</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Guaranteed Interest Returns</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Landmark size={20} />
         </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-1">
           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Deposit Amount</label>
           <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm outline-none dark:text-white" />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Interest Rate (%)</label>
              <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm outline-none dark:text-white" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Period (Years)</label>
              <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm outline-none dark:text-white" />
           </div>
        </div>

        <div className="space-y-1">
           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Compounding Frequency</label>
           <div className="grid grid-cols-3 gap-2">
              {[1, 4, 12].map(v => (
                <button key={v} onClick={() => setCompounding(v)} className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${compounding === v ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'}`}>
                  {v === 1 ? 'Yearly' : v === 4 ? 'Quarterly' : 'Monthly'}
                </button>
              ))}
           </div>
        </div>
      </div>

      {result && (
        <div className="p-6 bg-slate-900 dark:bg-slate-950 rounded-[2rem] text-white shadow-xl">
           <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Maturity Amount</p>
           <h4 className="text-4xl font-display font-bold text-brand-400 mb-6">₹{result.maturity.toLocaleString()}</h4>
           
           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 dark:border-slate-800">
              <div>
                 <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Interest Earned</p>
                 <p className="text-lg font-bold text-emerald-400">₹{result.interest.toLocaleString()}</p>
              </div>
              <div>
                 <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Total ROI</p>
                 <p className="text-lg font-bold">{((result.interest / principal) * 100).toFixed(1)}%</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FDCalculator;
