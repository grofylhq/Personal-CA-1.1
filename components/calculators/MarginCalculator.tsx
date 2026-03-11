
import React, { useState, useEffect } from 'react';
import { PieChart, TrendingUp } from 'lucide-react';

interface Props { initialData?: any; }

const MarginCalculator: React.FC<Props> = ({ initialData }) => {
  const [cost, setCost] = useState<number>(initialData?.cost || 100);
  const [price, setPrice] = useState<number>(initialData?.price || 150);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const profit = price - cost;
    const margin = price !== 0 ? (profit / price) * 100 : 0;
    const markup = cost !== 0 ? (profit / cost) * 100 : 0;
    setResult({
      profit,
      margin: isFinite(margin) ? margin.toFixed(2) : '0.00',
      markup: isFinite(markup) ? markup.toFixed(2) : '0.00'
    });
  }, [cost, price]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Margin & Markup</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Unit Economics Utility</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <PieChart size={20} />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Cost Price</label>
            <input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
         </div>
         <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Selling Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
         </div>
      </div>

      {result && (
        <div className="bg-slate-900 dark:bg-slate-950 border dark:border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-6 transition-colors">
           <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Gross Margin</p>
              <h4 className="text-5xl font-display font-bold text-brand-300 dark:text-brand-400">{result.margin}%</h4>
           </div>
           <div className="h-px bg-white/10 dark:bg-white/5" />
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Profit per Unit</p>
                 <p className="text-lg font-bold">₹{result.profit.toLocaleString()}</p>
              </div>
              <div>
                 <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Markup</p>
                 <p className="text-lg font-bold">{result.markup}%</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MarginCalculator;
