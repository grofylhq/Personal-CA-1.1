
import React, { useState, useEffect } from 'react';
import { Scale, Target } from 'lucide-react';

interface Props { initialData?: any; }

const BreakEvenCalculator: React.FC<Props> = ({ initialData }) => {
  const [fixed, setFixed] = useState<number>(initialData?.fixed || 50000);
  const [variable, setVariable] = useState<number>(initialData?.variable || 30);
  const [price, setPrice] = useState<number>(initialData?.price || 100);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const contribution = price - variable;
    const units = contribution > 0 ? fixed / contribution : Infinity;
    setResult({
      units: isFinite(units) ? Math.ceil(units) : 'N/A',
      sales: isFinite(units) ? Math.ceil(units * price) : 'N/A',
      contribution
    });
  }, [fixed, variable, price]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Break-Even Point</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Volume to Profit Analysis</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Scale size={20} />
         </div>
      </div>

      <div className="space-y-4">
         <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Fixed Costs (Monthly)</label>
            <input type="number" value={fixed} onChange={(e) => setFixed(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Variable Cost / Unit</label>
               <input type="number" value={variable} onChange={(e) => setVariable(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
            </div>
            <div>
               <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Price / Unit</label>
               <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
            </div>
         </div>
      </div>

      {result && (
        <div className="bg-slate-900 dark:bg-slate-950 border dark:border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-6 overflow-hidden relative transition-colors">
           <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={60} /></div>
           <div className="relative z-10">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Required Sales Volume</p>
              <h4 className="text-4xl font-display font-bold text-brand-300 dark:text-brand-400">{result.units} <span className="text-lg opacity-60">Units</span></h4>
              
              <div className="mt-8 pt-6 border-t border-white/10 dark:border-white/5 grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Break-Even Sales</p>
                    <p className="text-lg font-bold">₹{result.sales.toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Unit Contribution</p>
                    <p className="text-lg font-bold">₹{result.contribution.toLocaleString()}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BreakEvenCalculator;
