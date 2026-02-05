
import React, { useState, useEffect } from 'react';
import { ArrowRight, Receipt, Globe } from 'lucide-react';

interface GSTCalculatorProps {
  initialData?: any;
}

const GSTCalculator: React.FC<GSTCalculatorProps> = ({ initialData }) => {
  const [amount, setAmount] = useState<number>(initialData?.amount || 10000);
  const [rate, setRate] = useState<number>(initialData?.rate || 18);
  const [type, setType] = useState<'exclusive' | 'inclusive'>(initialData?.type || 'exclusive');
  const [isInterState, setIsInterState] = useState<boolean>(false);

  const [result, setResult] = useState<{ net: number; gst: number; cgst: number; sgst: number; igst: number; total: number } | null>(null);

  useEffect(() => {
    calculate();
  }, [amount, rate, type, isInterState]);

  const calculate = () => {
    let net = 0, gst = 0, total = 0;
    if (type === 'exclusive') {
      net = amount;
      gst = (amount * rate) / 100;
      total = net + gst;
    } else {
      total = amount;
      net = (amount * 100) / (100 + rate);
      gst = total - net;
    }

    const cgst = isInterState ? 0 : gst / 2;
    const sgst = isInterState ? 0 : gst / 2;
    const igst = isInterState ? gst : 0;

    setResult({ net, gst, cgst, sgst, igst, total });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Professional GST</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tax breakdown & Invoice preview</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Receipt size={20} />
         </div>
      </div>
      
      <div className="space-y-5">
        <div className="group">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-1">Base Amount</label>
          <div className="relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:bg-white dark:focus-within:bg-black">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-brand-600 transition-colors">₹</span>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-3.5 bg-transparent border-none text-slate-900 dark:text-white font-display font-bold text-lg outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-1">Tax Rate (%)</label>
              <select 
                value={rate} 
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-display font-bold outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white"
              >
                {[0, 5, 12, 18, 28].map(r => <option key={r} value={r} className="dark:bg-slate-900">{r}%</option>)}
              </select>
           </div>
           <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-1">Mode</label>
              <div className="flex bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1 rounded-xl">
                 <button onClick={() => setType('exclusive')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${type === 'exclusive' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>+ EXCL</button>
                 <button onClick={() => setType('inclusive')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${type === 'inclusive' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>- INCL</button>
              </div>
           </div>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-brand-50/50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/30">
           <div className="flex items-center gap-2.5">
              <Globe size={18} className="text-brand-600 dark:text-brand-400" />
              <div>
                 <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase leading-none">Supply Destination</p>
                 <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">{isInterState ? 'Inter-state (IGST)' : 'Intra-state (CGST + SGST)'}</p>
              </div>
           </div>
           <button 
             onClick={() => setIsInterState(!isInterState)}
             className={`w-10 h-6 rounded-full p-1 transition-colors ${isInterState ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'} relative`}
           >
             <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isInterState ? 'translate-x-4' : 'translate-x-0'}`}></div>
           </button>
        </div>
      </div>

      {result && (
        <div className="relative mt-6 group">
          <div className="absolute inset-0 bg-brand-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-2xl shadow-lg overflow-hidden flex flex-col gap-3 transition-colors">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-3 border-b border-slate-50 dark:border-slate-850">
               <span>Tax Invoice Preview</span>
               <Receipt size={14} />
            </div>
            
            <div className="space-y-2 text-sm pt-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Net Amount</span>
                <span className="font-mono font-bold">₹{result.net.toFixed(2)}</span>
              </div>
              
              {!isInterState ? (
                <>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 dark:text-slate-500">CGST ({rate/2}%)</span>
                    <span className="font-mono text-brand-600 dark:text-brand-400">₹{result.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 dark:text-slate-500">SGST ({rate/2}%)</span>
                    <span className="font-mono text-brand-600 dark:text-brand-400">₹{result.sgst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400 dark:text-slate-500">IGST ({rate}%)</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">₹{result.igst.toFixed(2)}</span>
                </div>
              )}
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-2"></div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Grand Total</span>
                <span className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">₹{result.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GSTCalculator;
