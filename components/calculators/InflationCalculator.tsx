
import React, { useState, useEffect } from 'react';
import { TrendingDown, Coins } from 'lucide-react';

interface Props { initialData?: any; }

const InflationCalculator: React.FC<Props> = ({ initialData }) => {
  const [amount, setAmount] = useState<number>(initialData?.amount || 100000);
  const [rate, setRate] = useState<number>(initialData?.rate || 6);
  const [years, setYears] = useState<number>(initialData?.years || 10);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const futureValue = amount * Math.pow(1 + rate/100, years);
    const purchasingPower = amount / Math.pow(1 + rate/100, years);
    setResult({
      future: Math.round(futureValue),
      power: Math.round(purchasingPower)
    });
  }, [amount, rate, years]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Inflation Impact</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Time Value of Money Analysis</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <TrendingDown size={20} />
         </div>
      </div>

      <div className="space-y-4">
         <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Current Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Inflation (%)</label>
               <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
            </div>
            <div>
               <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Years</label>
               <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
            </div>
         </div>
      </div>

      {result && (
        <div className="bg-slate-900 dark:bg-slate-950 border dark:border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-6 transition-colors">
           <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Purchasing Power after {years}y</p>
              <h4 className="text-4xl font-display font-bold text-rose-400">₹{result.power.toLocaleString()}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Current ₹{amount.toLocaleString()} will feel like this.</p>
           </div>
           <div className="h-px bg-white/10 dark:bg-white/5" />
           <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Equivalent Cost in Future</p>
              <h4 className="text-2xl font-display font-bold">₹{result.future.toLocaleString()}</h4>
           </div>
        </div>
      )}
    </div>
  );
};

export default InflationCalculator;
