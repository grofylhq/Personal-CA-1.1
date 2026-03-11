
import React, { useState, useEffect } from 'react';
import { Lock, PieChart, TrendingUp, Info } from 'lucide-react';

interface Props { initialData?: any; }

const NPSCalculator: React.FC<Props> = ({ initialData }) => {
  const [investment, setInvestment] = useState<number>(initialData?.amount || 10000);
  const [age, setAge] = useState<number>(initialData?.age || 30);
  const [rate, setRate] = useState<number>(initialData?.rate || 10);
  const [annuityRatio, setAnnuityRatio] = useState<number>(40); // 40% minimum

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const years = 60 - age;
    const months = years > 0 ? years * 12 : 0;
    const monthlyRate = rate / 12 / 100;
    
    let totalCorpus = 0;
    let invested = investment * months;
    
    if (monthlyRate === 0) {
      totalCorpus = invested;
    } else {
      totalCorpus = investment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    }
    
    const annuity = (totalCorpus * annuityRatio) / 100;
    const lumpSum = totalCorpus - annuity;
    const estPension = (annuity * 0.06) / 12; // Assuming 6% annuity rate

    setResult({
      totalCorpus: isFinite(totalCorpus) ? totalCorpus : 0,
      invested,
      lumpSum: isFinite(lumpSum) ? lumpSum : 0,
      annuity: isFinite(annuity) ? annuity : 0,
      estPension: isFinite(estPension) ? estPension : 0,
      taxBenefit: years > 0 ? Math.min(50000, invested / years) * 0.3 : 0 // Simplified Sec 80CCD(1B) benefit
    });
  }, [investment, age, rate, annuityRatio]);

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">NPS Strategist</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Retirement & Tax Planning</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Lock size={20} />
         </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
           <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Contribution</label>
              <span className="text-xs font-bold dark:text-white">₹{investment.toLocaleString()}</span>
           </div>
           <input type="range" min="500" max="50000" step="500" value={investment} onChange={(e) => setInvestment(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Current Age</label>
              <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm outline-none dark:text-white" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Expected Rate (%)</label>
              <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm outline-none dark:text-white" />
           </div>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
           <div className="p-6 bg-slate-900 dark:bg-slate-950 rounded-[2rem] text-white shadow-xl">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Maturity Corpus (at 60)</p>
              <h4 className="text-4xl font-display font-bold text-brand-400 mb-6">₹{(result.totalCorpus / 10000000).toFixed(2)} Cr</h4>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 dark:border-slate-800">
                 <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Monthly Pension</p>
                    <p className="text-lg font-bold text-emerald-400">₹{Math.round(result.estPension).toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Lump Sum (Tax Free)</p>
                    <p className="text-lg font-bold">₹{(result.lumpSum / 100000).toFixed(1)}L</p>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900 rounded-2xl flex items-center gap-3">
              <TrendingUp size={16} className="text-emerald-500 shrink-0" />
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                 <span className="font-bold">Tax Efficiency:</span> Secure an additional <span className="font-bold">₹50,000</span> deduction under Section 80CCD(1B) beyond the ₹1.5L limit.
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default NPSCalculator;
