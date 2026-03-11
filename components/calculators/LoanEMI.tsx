
import React, { useState, useEffect } from 'react';
import { Percent, Wallet } from 'lucide-react';

interface Props { initialData?: any; }

const LoanEMICalculator: React.FC<Props> = ({ initialData }) => {
  const [principal, setPrincipal] = useState<number>(initialData?.amount || 1000000);
  const [rate, setRate] = useState<number>(initialData?.rate || 8.5);
  const [tenure, setTenure] = useState<number>(initialData?.tenure || 15);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const r = rate / 12 / 100;
    const n = tenure * 12;
    let emi = 0;
    if (r === 0) {
      emi = principal / n;
    } else {
      emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    const totalPayable = emi * n;
    setResult({
      emi: isFinite(emi) ? Math.round(emi) : 0,
      total: isFinite(totalPayable) ? Math.round(totalPayable) : 0,
      interest: isFinite(totalPayable) ? Math.round(totalPayable - principal) : 0
    });
  }, [principal, rate, tenure]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Loan EMI</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Repayment & Interest Analysis</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Percent size={20} />
         </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between mb-2"><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Loan Amount</label><span className="text-sm font-bold dark:text-white">₹{principal.toLocaleString()}</span></div>
          <input type="range" min="100000" max="10000000" step="50000" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Interest (%)</label>
              <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tenure (Years)</label>
              <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none dark:border-slate-800 rounded-xl font-display font-semibold outline-none dark:text-white" />
           </div>
        </div>
      </div>

      {result && (
        <div className="bg-slate-900 dark:bg-slate-950 border dark:border-slate-800 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Monthly EMI</p>
            <h4 className="text-4xl font-display font-bold text-white mb-6">₹{result.emi.toLocaleString()}</h4>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 dark:border-slate-800">
               <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Total Interest</p>
                  <p className="text-lg font-bold text-brand-300">₹{result.interest.toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Total Amount</p>
                  <p className="text-lg font-bold">₹{result.total.toLocaleString()}</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanEMICalculator;
