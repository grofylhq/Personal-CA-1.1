
import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowRight, ShieldCheck, Info } from 'lucide-react';

interface Props { initialData?: any; }

const CapitalGainsCalculator: React.FC<Props> = ({ initialData }) => {
  const [assetType, setAssetType] = useState<'Equity' | 'Property' | 'Gold'>('Equity');
  const [purchasePrice, setPurchasePrice] = useState<number>(initialData?.purchase || 500000);
  const [salePrice, setSalePrice] = useState<number>(initialData?.sale || 750000);
  const [holdingPeriod, setHoldingPeriod] = useState<number>(initialData?.years || 1);
  
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const gain = salePrice - purchasePrice;
    let isLTCG = false;
    let rate = 0;
    let exemption = 0;

    if (assetType === 'Equity') {
      isLTCG = holdingPeriod > 1;
      rate = isLTCG ? 12.5 : 20; // New Budget 2024 Rates
      exemption = isLTCG ? 125000 : 0; // Exemption up to 1.25L for Equity LTCG
    } else {
      isLTCG = holdingPeriod > 2;
      rate = isLTCG ? 12.5 : 20; // Indexation removed for Property in Budget 2024
    }

    const taxableGain = Math.max(0, gain - exemption);
    const taxAmount = (taxableGain * rate) / 100;

    setResult({
      gain,
      isLTCG,
      rate,
      exemption,
      taxableGain,
      taxAmount: taxAmount * 1.04 // Including 4% Cess
    });
  }, [assetType, purchasePrice, salePrice, holdingPeriod]);

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Capital Gains</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">FY 2024-25 Budget Update</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <TrendingUp size={20} />
         </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {['Equity', 'Property', 'Gold'].map(type => (
            <button
              key={type}
              onClick={() => setAssetType(type as any)}
              className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${assetType === type ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'}`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Purchase Price</label>
            <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm outline-none dark:text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sale Price</label>
            <input type="number" value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm outline-none dark:text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center mb-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Holding Period (Years)</label>
             <span className="text-xs font-bold dark:text-white">{holdingPeriod} Year{holdingPeriod !== 1 ? 's' : ''}</span>
          </div>
          <input type="range" min="0" max="10" step="1" value={holdingPeriod} onChange={(e) => setHoldingPeriod(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
        </div>
      </div>

      {result && (
        <div className="space-y-4">
           <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-2xl text-white shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={60} /></div>
              <div className="relative z-10">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">{result.isLTCG ? 'Long Term (LTCG)' : 'Short Term (STCG)'}</span>
                    <span className="text-xl font-display font-bold text-brand-400">{result.rate}%</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Est. Tax Liability</p>
                       <p className="text-3xl font-display font-bold">₹{Math.round(result.taxAmount).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Net Gain</p>
                       <p className="text-lg font-bold text-emerald-400">₹{result.gain.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start gap-3">
              <Info size={16} className="text-brand-500 mt-0.5" />
              <div className="text-[11px] leading-relaxed text-slate-500">
                <p><span className="font-bold text-slate-700 dark:text-slate-300">Budget 2024 Notice:</span> LTCG rate is now 12.5% for all assets. STCG for specified financial assets is 20%. Exemption on Equity LTCG increased to ₹1.25L. Indexation benefit removed for real estate acquired after 2001.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CapitalGainsCalculator;
