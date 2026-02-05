
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Coins, ArrowUpRight } from 'lucide-react';

interface SIPCalculatorProps {
  initialData?: any;
}

const SIPCalculator: React.FC<SIPCalculatorProps> = ({ initialData }) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(initialData?.amount || 5000);
  const [rate, setRate] = useState<number>(initialData?.rate || 12);
  const [years, setYears] = useState<number>(initialData?.years || 15);
  const [stepUp, setStepUp] = useState<number>(0); 

  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ invested: 0, returns: 0, total: 0 });

  useEffect(() => {
    calculateSIP();
  }, [monthlyInvestment, rate, years, stepUp]);

  const calculateSIP = () => {
    const r = (Number(rate) || 0) / 12 / 100;
    const y = Number(years) || 0;
    const monthly = Number(monthlyInvestment) || 0;
    const step = Number(stepUp) || 0;

    let totalInvested = 0;
    let currentValue = 0;
    let currentMonthly = monthly;
    const chartData = [];

    if (y > 0) {
      for (let year = 1; year <= y; year++) {
        for (let month = 1; month <= 12; month++) {
          totalInvested += currentMonthly;
          currentValue = (currentValue + currentMonthly) * (1 + r);
        }
        // Annual step-up applies AFTER the first year
        currentMonthly = currentMonthly * (1 + step / 100);
        
        chartData.push({
          year: `Yr ${year}`,
          invested: Math.round(totalInvested),
          value: Math.round(currentValue)
        });
      }
    }

    setData(chartData);
    setSummary({
      invested: Math.round(totalInvested),
      returns: Math.round(Math.max(0, currentValue - totalInvested)),
      total: Math.round(currentValue)
    });
  };

  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Wealth Architect</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">SIP with Growth Step-up</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={20} />
         </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2.5">
             <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Monthly Commitment</label>
             <span className="text-sm font-display font-bold text-slate-900 dark:text-white">₹{Math.round(monthlyInvestment).toLocaleString()}</span>
          </div>
          <input 
            type="range" 
            min="500" max="200000" step="500"
            value={monthlyInvestment || 0}
            onChange={(e) => setMonthlyInvestment(parseInt(e.target.value) || 0)}
            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Expected Return (%)</label>
              <input 
                type="number" value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Duration (Years)</label>
              <input 
                type="number" value={years}
                onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Annual Step-up (%)</label>
              <div className="flex gap-2">
                 {[0, 5, 10, 15].map(v => (
                   <button 
                     key={v}
                     onClick={() => setStepUp(v)}
                     className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${stepUp === v ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-black' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-brand-200'}`}
                   >
                     {v === 0 ? 'Fixed' : `${v}%`}
                   </button>
                 ))}
              </div>
            </div>
        </div>
      </div>

      <div className="h-48 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1a1a1a' : '#f1f5f9'} />
            <Tooltip 
              contentStyle={{ backgroundColor: isDarkMode ? '#0a0a0a' : '#fff', borderRadius: '12px', border: isDarkMode ? '1px solid #1a1a1a' : 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              formatter={(value: number) => [`₹${(value/100000).toFixed(2)}L`, 'Wealth']}
              labelStyle={{ color: isDarkMode ? '#666' : '#999', fontSize: '10px', textTransform: 'uppercase' }}
            />
            <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} fill="url(#colorValue)" animationDuration={1500} />
            <Area type="monotone" dataKey="invested" stroke={isDarkMode ? '#404040' : '#94a3b8'} strokeWidth={1} strokeDasharray="4 4" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900 dark:bg-slate-950 border dark:border-slate-800 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group">
         <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Coins size={60} /></div>
         
         <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
            <div>
               <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Total Invested</p>
               <p className="text-sm font-bold">₹{(summary.invested/100000).toFixed(2)} L</p>
            </div>
            <div>
               <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Estimated Growth</p>
               <p className="text-sm font-bold text-emerald-400">₹{(summary.returns/100000).toFixed(2)} L</p>
            </div>
         </div>
         
         <div className="relative z-10 pt-4 border-t border-white/10 dark:border-slate-800">
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[9px] text-brand-300 uppercase tracking-widest font-bold mb-1">Maturity Corpus</p>
                   <p className="text-2xl font-display font-bold tracking-tight text-white">
                      ₹{summary.total >= 10000000 ? `${(summary.total/10000000).toFixed(2)} Cr` : `${(summary.total/100000).toFixed(2)} L`}
                   </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg text-[10px] font-bold">
                   <ArrowUpRight size={12} className="text-brand-400" />
                   STRATEGIC
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default SIPCalculator;
