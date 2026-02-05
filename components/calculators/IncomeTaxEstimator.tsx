
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, Calculator, ArrowDownRight, ArrowRight, TrendingUp } from 'lucide-react';

interface Props { initialData?: any; }

const IncomeTaxEstimator: React.FC<Props> = ({ initialData }) => {
  // Income Heads
  const [salary, setSalary] = useState<number>(initialData?.income || 1200000);
  
  // House Property details
  const [rentReceived, setRentReceived] = useState<number>(0);
  const [muniTaxes, setMuniTaxes] = useState<number>(0);
  const [hpInterest, setHpInterest] = useState<number>(0);
  
  const [businessIncome, setBusinessIncome] = useState<number>(0);
  const [stcg, setStcg] = useState<number>(0);
  const [ltcg, setLtcg] = useState<number>(0);
  const [otherSources, setOtherSources] = useState<number>(0);

  // Deductions (Old Regime)
  const [deduction80C, setDeduction80C] = useState<number>(150000);
  const [deduction80D, setDeduction80D] = useState<number>(25000);
  const [deduction80TTA, setDeduction80TTA] = useState<number>(10000);

  const [expandedSection, setExpandedSection] = useState<string | null>('salary');

  // Calculations
  const calculateHPIncome = () => {
    const nav = Math.max(0, rentReceived - muniTaxes);
    const stdDed = nav * 0.3; // 30% deduction u/s 24(a)
    return nav - stdDed - hpInterest;
  };

  const hpIncome = calculateHPIncome();
  const hpLossToSetOff = hpIncome < 0 ? Math.min(200000, Math.abs(hpIncome)) : 0;
  const grossTotalIncome = salary + businessIncome + stcg + ltcg + otherSources + (hpIncome > 0 ? hpIncome : 0);
  const deductionsOld = Math.min(150000, deduction80C) + deduction80D + deduction80TTA;

  const calculateNewRegimeTax = (gti: number) => {
    const standardDeduction = 75000;
    const taxable = Math.max(0, gti - standardDeduction);
    if (taxable <= 700000) return 0;
    
    let tax = 0;
    if (taxable > 1500000) tax = (taxable - 1500000) * 0.3 + 150000;
    else if (taxable > 1200000) tax = (taxable - 1200000) * 0.2 + 90000;
    else if (taxable > 900000) tax = (taxable - 900000) * 0.15 + 45000;
    else if (taxable > 600000) tax = (taxable - 600000) * 0.1 + 15000;
    else if (taxable > 300000) tax = (taxable - 300000) * 0.05;
    
    return tax * 1.04; 
  };

  const calculateOldRegimeTax = (gti: number, hpLoss: number, ded: number) => {
    const standardDeduction = 50000;
    const taxableAfterSetoff = Math.max(0, gti - hpLoss);
    const finalTaxable = Math.max(0, taxableAfterSetoff - standardDeduction - ded);
    if (finalTaxable <= 500000) return 0;
    
    let tax = 0;
    if (finalTaxable > 1000000) tax = (finalTaxable - 1000000) * 0.3 + 112500;
    else if (finalTaxable > 500000) tax = (finalTaxable - 500000) * 0.2 + 12500;
    else if (finalTaxable > 250000) tax = (finalTaxable - 250000) * 0.05;
    
    return tax * 1.04;
  };

  const newTax = calculateNewRegimeTax(grossTotalIncome);
  const oldTax = calculateOldRegimeTax(grossTotalIncome, hpLossToSetOff, deductionsOld);
  const recommended = newTax < oldTax ? 'New' : 'Old';

  const InputGroup = ({ label, value, onChange, desc }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        {desc && <span className="text-[9px] text-slate-400 dark:text-slate-500 italic">{desc}</span>}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange && onChange(Number(e.target.value) || 0)}
          className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Tax Expert Computation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">FY 2024-25 (AY 2025-26)</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShieldCheck size={20} />
         </div>
      </div>

      <div className="space-y-3">
        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
          <button onClick={() => setExpandedSection(expandedSection === 'salary' ? null : 'salary')} className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <ArrowRight size={14} className="text-brand-500" /> Salary, Business & Others
            </span>
            {expandedSection === 'salary' ? <ChevronUp size={16} className="dark:text-slate-400"/> : <ChevronDown size={16} className="dark:text-slate-400"/>}
          </button>
          {expandedSection === 'salary' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <InputGroup label="Gross Salary" value={salary} onChange={setSalary} />
              <InputGroup label="Income from Other Sources" value={otherSources} onChange={setOtherSources} desc="Savings Int/FD/Div" />
              <InputGroup label="Business/Profession Income" value={businessIncome} onChange={setBusinessIncome} />
            </div>
          )}
        </div>

        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
          <button onClick={() => setExpandedSection(expandedSection === 'cg' ? null : 'cg')} className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-brand-500" /> Capital Gains
            </span>
            {expandedSection === 'cg' ? <ChevronUp size={16} className="dark:text-slate-400"/> : <ChevronDown size={16} className="dark:text-slate-400"/>}
          </button>
          {expandedSection === 'cg' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <InputGroup label="Short Term Capital Gains (STCG)" value={stcg} onChange={setStcg} desc="Stock/Property < 1-2yr" />
              <InputGroup label="Long Term Capital Gains (LTCG)" value={ltcg} onChange={setLtcg} desc="Stock/Property > 1-2yr" />
            </div>
          )}
        </div>

        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
          <button onClick={() => setExpandedSection(expandedSection === 'hp' ? null : 'hp')} className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Calculator size={14} className="text-brand-500" /> House Property (u/s 24)
            </span>
            {expandedSection === 'hp' ? <ChevronUp size={16} className="dark:text-slate-400"/> : <ChevronDown size={16} className="dark:text-slate-400"/>}
          </button>
          {expandedSection === 'hp' && (
            <div className="p-4 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Rent Received" value={rentReceived} onChange={setRentReceived} />
                <InputGroup label="Municipal Taxes Paid" value={muniTaxes} onChange={setMuniTaxes} />
                <InputGroup label="Interest on Home Loan" value={hpInterest} onChange={setHpInterest} desc="Self/Let-out" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-inner">
                <div className="flex justify-between mb-1"><span>Net Annual Value (Rent - Taxes):</span> <span className="font-bold">₹{Math.max(0, rentReceived - muniTaxes).toLocaleString()}</span></div>
                <div className="flex justify-between mb-1"><span>Standard Deduction (30% u/s 24a):</span> <span className="text-rose-500">-₹{(Math.max(0, rentReceived - muniTaxes) * 0.3).toLocaleString()}</span></div>
                <div className="flex justify-between mb-1"><span>Home Loan Interest Deduction (u/s 24b):</span> <span className="text-rose-500">-₹{hpInterest.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 mt-2 pt-2 text-slate-900 dark:text-white">
                  <span>Net HP Income/Loss:</span> 
                  <span className={hpIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}>₹{hpIncome.toLocaleString()}</span>
                </div>
                {hpIncome < 0 && (
                   <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 italic font-normal">* Loss from HP can be set-off against other heads up to ₹2 Lakhs in Old Regime.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
          <button onClick={() => setExpandedSection(expandedSection === 'ded' ? null : 'ded')} className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} className="text-brand-500" /> Deductions (Old Regime)
            </span>
            {expandedSection === 'ded' ? <ChevronUp size={16} className="dark:text-slate-400"/> : <ChevronDown size={16} className="dark:text-slate-400"/>}
          </button>
          {expandedSection === 'ded' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <InputGroup label="Section 80C (LIC, PPF, etc)" value={deduction80C} onChange={setDeduction80C} desc="Max 1.5L" />
              <InputGroup label="Section 80D (Health Insurance)" value={deduction80D} onChange={setDeduction80D} desc="Premium paid" />
              <InputGroup label="80TTA/TTB (Savings Interest)" value={deduction80TTA} onChange={setDeduction80TTA} desc="Max 10k/50k" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group border border-slate-800">
        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
           <Calculator size={100} />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2 border border-brand-500/20">
              <CheckCircle2 size={12} /> Recommended Choice
            </div>
            <h4 className="text-3xl font-display font-bold text-white tracking-tight">{recommended} Regime</h4>
          </div>
          <div className="text-left md:text-right">
             <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Potential Tax Savings</p>
             <p className="text-3xl font-display font-bold text-emerald-400">₹{Math.abs(oldTax - newTax).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3 text-[11px] font-medium relative z-10">
           <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/10 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-tighter">
             <span>Computation Particulars</span>
             <span className="text-right">Old Regime</span>
             <span className="text-right">New Regime</span>
           </div>
           
           <div className="grid grid-cols-3 gap-2 py-1">
             <span className="text-slate-400">Gross Total Income</span>
             <span className="text-right">₹{grossTotalIncome.toLocaleString()}</span>
             <span className="text-right">₹{grossTotalIncome.toLocaleString()}</span>
           </div>
           
           <div className="grid grid-cols-3 gap-2 py-1">
             <div className="flex flex-col">
               <span className="text-slate-400">House Property Loss Set-off</span>
               <span className="text-[9px] text-slate-500 italic font-normal">u/s 71</span>
             </div>
             <span className="text-right text-rose-400">-₹{hpLossToSetOff.toLocaleString()}</span>
             <span className="text-right text-slate-500">N/A</span>
           </div>
           
           <div className="grid grid-cols-3 gap-2 py-1">
             <span className="text-slate-400">Standard Deduction (Salary)</span>
             <span className="text-right text-rose-400">-₹50,000</span>
             <span className="text-right text-rose-400">-₹75,000</span>
           </div>
           
           <div className="grid grid-cols-3 gap-2 py-1">
             <span className="text-slate-400">Deductions (Chapter VI-A)</span>
             <span className="text-right text-rose-400">-₹{deductionsOld.toLocaleString()}</span>
             <span className="text-right text-slate-500">N/A</span>
           </div>
           
           <div className="grid grid-cols-3 gap-2 font-bold py-3 bg-white/5 rounded-2xl px-3 -mx-3 mt-2 border border-white/5 dark:border-slate-800">
             <span className="text-white">Net Taxable Income</span>
             <span className="text-right">₹{Math.max(0, grossTotalIncome - hpLossToSetOff - 50000 - deductionsOld).toLocaleString()}</span>
             <span className="text-right">₹{Math.max(0, grossTotalIncome - 75000).toLocaleString()}</span>
           </div>
           
           <div className="grid grid-cols-3 gap-2 pt-6 text-xl font-display font-bold items-end">
             <div className="flex flex-col">
               <span className="text-brand-400">Final Tax</span>
               <span className="text-[10px] text-slate-500 font-normal">incl. 4% Cess</span>
             </div>
             <span className="text-right text-white">₹{Math.round(oldTax).toLocaleString()}</span>
             <span className="text-right text-emerald-400">₹{Math.round(newTax).toLocaleString()}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

export default IncomeTaxEstimator;
