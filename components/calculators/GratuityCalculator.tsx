
import React, { useState, useEffect } from 'react';
import { Coins, Briefcase, Info } from 'lucide-react';

interface Props { initialData?: any; }

const GratuityCalculator: React.FC<Props> = ({ initialData }) => {
  const [salary, setSalary] = useState<number>(initialData?.salary || 100000);
  const [tenure, setTenure] = useState<number>(initialData?.tenure || 5);
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    // Formula: (15 * Basic Salary * Tenure) / 26
    const amount = (15 * salary * tenure) / 26;
    setResult(Math.round(amount));
  }, [salary, tenure]);

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Gratuity Calculator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Payment of Gratuity Act, 1972</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Coins size={20} />
         </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-1">
           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Last Drawn (Basic + DA)</label>
           <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm outline-none dark:text-white" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center mb-1 px-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed Tenure (Years)</label>
             <span className="text-xs font-bold dark:text-white">{tenure} Years</span>
          </div>
          <input type="range" min="5" max="40" step="1" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
          {tenure < 5 && <p className="text-[9px] text-rose-500 font-bold mt-1 px-1">Minimum 5 years required for eligibility.</p>}
        </div>
      </div>

      <div className="p-6 bg-slate-900 dark:bg-slate-950 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
         <div className="absolute right-0 bottom-0 p-4 opacity-5"><Briefcase size={80} /></div>
         <div className="relative z-10">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Estimated Payout</p>
            <h4 className="text-4xl font-display font-bold text-brand-400">₹{result.toLocaleString()}</h4>
            <div className="h-px bg-white/10 dark:bg-white/5 my-4" />
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              Calculation based on the 15/26 rule. Tax-exempt up to ₹20 Lakhs for non-government employees.
            </p>
         </div>
      </div>
    </div>
  );
};

export default GratuityCalculator;
