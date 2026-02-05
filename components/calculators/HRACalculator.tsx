
import React, { useState, useEffect } from 'react';
import { Home, Calculator, Info, CheckCircle2, MapPin, Building2 } from 'lucide-react';

interface Props { initialData?: any; }

const HRACalculator: React.FC<Props> = ({ initialData }) => {
  const [basic, setBasic] = useState<number>(initialData?.basic || 50000);
  const [hra, setHra] = useState<number>(initialData?.hra || 20000);
  const [rent, setRent] = useState<number>(initialData?.rent || 15000);
  const [isMetro, setIsMetro] = useState<boolean>(initialData?.isMetro ?? true);
  
  const [steps, setSteps] = useState<any>(null);

  useEffect(() => {
    const limit1 = hra;
    const limit2 = isMetro ? basic * 0.5 : basic * 0.4;
    const limit3 = Math.max(0, rent - (basic * 0.1));
    const exempt = Math.min(limit1, limit2, limit3);
    
    setSteps({
      limit1,
      limit2,
      limit3,
      exempt,
      taxable: hra - exempt
    });
  }, [basic, hra, rent, isMetro]);

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">HRA Exemption</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Section 10(13A) of Income Tax Act</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Home size={20} />
         </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
           <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Location Context</label>
           <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
             <button 
               onClick={() => setIsMetro(true)} 
               className={`flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${isMetro ? 'bg-white dark:bg-slate-800 shadow-md text-slate-900 dark:text-white translate-y-[-1px]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
               <Building2 size={14} className={isMetro ? "text-brand-500" : "text-slate-400"} />
               Metro Cities <span className="opacity-40 font-normal">(50%)</span>
             </button>
             <button 
               onClick={() => setIsMetro(false)} 
               className={`flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${!isMetro ? 'bg-white dark:bg-slate-800 shadow-md text-slate-900 dark:text-white translate-y-[-1px]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
               <MapPin size={14} className={!isMetro ? "text-brand-500" : "text-slate-400"} />
               Non-Metro <span className="opacity-40 font-normal">(40%)</span>
             </button>
           </div>
           <p className="px-2 text-[9px] text-slate-400 dark:text-slate-500 italic">
             * Metros: Mumbai, Delhi, Kolkata, Chennai. All other cities are Non-Metro for HRA purposes.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
             <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Basic Salary</label>
             <div className="relative group">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold group-focus-within:text-brand-600">₹</span>
               <input type="number" value={basic} onChange={(e) => setBasic(Number(e.target.value))} className="w-full pl-7 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-black transition-all dark:text-white" />
             </div>
          </div>
          <div className="space-y-1.5">
             <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly HRA Received</label>
             <div className="relative group">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold group-focus-within:text-brand-600">₹</span>
               <input type="number" value={hra} onChange={(e) => setHra(Number(e.target.value))} className="w-full pl-7 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-black transition-all dark:text-white" />
             </div>
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1.5">
             <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actual Monthly Rent Paid</label>
             <div className="relative group">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold group-focus-within:text-brand-600">₹</span>
               <input type="number" value={rent} onChange={(e) => setRent(Number(e.target.value))} className="w-full pl-7 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-black transition-all dark:text-white" />
             </div>
          </div>
        </div>
      </div>

      {steps && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Info size={12} className="text-blue-500" /> Computation Breakdown
              </h4>
              <span className="text-[9px] bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 px-2 py-1 rounded-full font-bold">EXEMPTION = LEAST OF 3</span>
            </div>
            
            <div className="space-y-3">
              <div className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-500 ${steps.exempt === steps.limit1 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900 shadow-sm' : 'bg-slate-50/50 dark:bg-slate-850 border-transparent'}`}>
                <div className="text-xs">
                  <p className={`font-bold ${steps.exempt === steps.limit1 ? 'text-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>1. Actual HRA Received</p>
                  <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-0.5">Component in your CTC</p>
                </div>
                <div className="text-right">
                   <span className={`font-display font-bold block ${steps.exempt === steps.limit1 ? 'dark:text-white' : 'dark:text-slate-400'}`}>₹{steps.limit1.toLocaleString()}</span>
                   {steps.exempt === steps.limit1 && <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Selected</span>}
                </div>
              </div>
              
              <div className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-500 ${steps.exempt === steps.limit2 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900 shadow-sm' : 'bg-slate-50/50 dark:bg-slate-850 border-transparent'}`}>
                <div className="text-xs">
                  <p className={`font-bold ${steps.exempt === steps.limit2 ? 'text-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>2. {isMetro ? '50%' : '40%'} of Basic</p>
                  <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-0.5">{isMetro ? 'Metro' : 'Non-Metro'} limit applies</p>
                </div>
                <div className="text-right">
                   <span className={`font-display font-bold block ${steps.exempt === steps.limit2 ? 'dark:text-white' : 'dark:text-slate-400'}`}>₹{steps.limit2.toLocaleString()}</span>
                   {steps.exempt === steps.limit2 && <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Selected</span>}
                </div>
              </div>
              
              <div className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-500 ${steps.exempt === steps.limit3 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900 shadow-sm' : 'bg-slate-50/50 dark:bg-slate-850 border-transparent'}`}>
                <div className="text-xs">
                  <p className={`font-bold ${steps.exempt === steps.limit3 ? 'text-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>3. Rent Paid - 10% of Basic</p>
                  <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-0.5">Excess rent over threshold</p>
                </div>
                <div className="text-right">
                   <span className={`font-display font-bold block ${steps.exempt === steps.limit3 ? 'dark:text-white' : 'dark:text-slate-400'}`}>₹{steps.limit3.toLocaleString()}</span>
                   {steps.exempt === steps.limit3 && <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Selected</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 border dark:border-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <CheckCircle2 size={80} />
             </div>
             <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                   <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Monthly Exemption</span>
                      <span className="text-4xl font-display font-bold text-emerald-400 tracking-tight">₹{steps.exempt.toLocaleString()}</span>
                   </div>
                   <div className="text-right">
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Annual</span>
                      <span className="text-lg font-display font-bold text-white opacity-80">₹{(steps.exempt * 12).toLocaleString()}</span>
                   </div>
                </div>
                <div className="h-px bg-white/10 dark:bg-slate-800 my-6 w-full" />
                <div className="flex justify-between items-center">
                   <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Monthly Taxable Component</span>
                      <span className="text-2xl font-display font-bold text-white">₹{steps.taxable.toLocaleString()}</span>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-400">
                      <Building2 size={18} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRACalculator;
