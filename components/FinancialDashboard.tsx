import React, { useEffect, useRef } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, ReferenceLine
} from 'recharts';
import { UserProfile, FinancialGoal } from '../types';
import { 
  Landmark, TrendingUp, Wallet, ShieldCheck, 
  PlusCircle, Calculator, Percent, BarChart3, ChevronRight, Zap, Info,
  AlertCircle, CheckCircle2, Sparkles, ArrowUpRight, TrendingDown, Target,
  ArrowRight, Home, GraduationCap, Plane, Heart, Briefcase
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  onLaunchTool: (toolId: string, data?: any) => void;
}

const FinancialDashboard: React.FC<Props> = ({ profile, onLaunchTool }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const headerBlobRef = useRef<HTMLDivElement>(null);
  const largeCardBlobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList?.contains('custom-scrollbar')) {
        const scrollTop = target.scrollTop;
        if (headerBlobRef.current) {
          headerBlobRef.current.style.transform = `translateY(${scrollTop * 0.15}px)`;
        }
        if (largeCardBlobRef.current) {
           largeCardBlobRef.current.style.transform = `translateY(${scrollTop * 0.08}px)`;
        }
      }
    };
    document.addEventListener('scroll', handleScroll, true);
    return () => document.removeEventListener('scroll', handleScroll, true);
  }, []);
  
  const assetData = [
    { name: 'Cash', value: profile.assets.cash, color: '#14b8a6' },
    { name: 'Equity', value: profile.assets.equity, color: '#6366f1' },
    { name: 'Real Estate', value: profile.assets.realEstate, color: '#f59e0b' },
    { name: 'Gold', value: profile.assets.gold, color: '#facc15' },
    { name: 'Emergency', value: profile.assets.emergencyFund, color: '#ec4899' },
  ].filter(item => item.value > 0);

  const totalAssetsSum = assetData.reduce((acc, curr) => acc + curr.value, 0);
  const totalLiabilities = (Object.values(profile.liabilities) as number[]).reduce((a, b) => a + b, 0);
  const netWorth = totalAssetsSum - totalLiabilities;
  const savings = profile.monthlyIncome - profile.monthlyExpenses;
  const savingsRate = profile.monthlyIncome > 0 ? (savings / profile.monthlyIncome) * 100 : 0;

  const calculateHealth = () => {
    let score = 0;
    if (savingsRate > 20) score += 40;
    else if (savingsRate > 10) score += 20;
    const debtRatio = totalLiabilities / (totalAssetsSum || 1);
    if (debtRatio < 0.1) score += 30;
    else if (debtRatio < 0.3) score += 15;
    const emergencyCoverage = profile.assets.emergencyFund / (profile.monthlyExpenses || 1);
    if (emergencyCoverage >= 6) score += 30;
    else if (emergencyCoverage >= 3) score += 15;
    return score;
  };

  const healthScore = calculateHealth();
  const getHealthStatus = () => {
    if (healthScore >= 80) return { label: 'Optimal', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: <CheckCircle2 size={16}/> };
    if (healthScore >= 50) return { label: 'Stable', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', icon: <Sparkles size={16}/> };
    return { label: 'Needs Attention', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', icon: <AlertCircle size={16}/> };
  };

  const health = getHealthStatus();

  const stackedCashflowData = [
    { 
      name: 'Cash Flow', 
      Expenses: profile.monthlyExpenses, 
      Savings: Math.max(0, savings),
      Total: profile.monthlyIncome
    },
  ];

  const projectionData = Array.from({ length: 11 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    const growthRate = profile.riskAppetite === 'Aggressive' ? 0.12 : profile.riskAppetite === 'Moderate' ? 0.09 : 0.06;
    const p = netWorth;
    const pmt = savings * 12;
    const r = growthRate;
    const t = i;
    let futureValue = p * Math.pow(1 + r, t);
    if (t > 0 && r > 0) futureValue += pmt * ((Math.pow(1 + r, t) - 1) / r);
    return { year: year.toString(), wealth: Math.round(futureValue) };
  });

  const getGoalIcon = (category: string) => {
    switch (category) {
      case 'House': return <Home size={16} />;
      case 'Education': return <GraduationCap size={16} />;
      case 'Retirement': return <Briefcase size={16} />;
      case 'Travel': return <Plane size={16} />;
      default: return <Heart size={16} />;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 px-4 md:px-10 lg:px-0 pt-8 md:pt-12">
      {/* Dynamic Health Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-premium dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative transition-colors">
         <div 
           ref={headerBlobRef}
           className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 dark:bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-2xl"
           style={{ willChange: 'transform' }}
         ></div>
         <div className="flex items-center gap-4 relative z-10">
            <div className={`w-14 h-14 rounded-2xl ${health.bg} flex items-center justify-center ${health.color} shadow-inner`}>
               {healthScore >= 80 ? <CheckCircle2 size={28}/> : healthScore >= 50 ? <Sparkles size={28}/> : <AlertCircle size={28}/>}
            </div>
            <div>
               <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Financial Vitality</h2>
               <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-bold uppercase tracking-widest ${health.color}`}>{health.label}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Score: {healthScore}/100</span>
               </div>
            </div>
         </div>
         <div className="flex-1 max-w-xs w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden relative">
            <div className={`h-full transition-all duration-1000 ease-out rounded-full ${healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-brand-500' : 'bg-rose-500'}`} style={{ width: `${healthScore}%` }}></div>
         </div>
         <button onClick={() => onLaunchTool('compliance_calendar')} className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 dark:text-black px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-all group z-10 shadow-sm uppercase tracking-widest">
            Check Grid <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
         </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-premium dark:shadow-none border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-500 transition-all group cursor-default">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><Wallet size={24} /></div>
             <span className="text-[9px] font-bold bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 px-2 py-1 rounded-lg uppercase">Liquid</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Net Worth</p>
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-1">₹{(netWorth / 100000).toFixed(2)}L</h3>
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between">
             <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Assets: ₹{(totalAssetsSum / 100000).toFixed(1)}L</span>
             <TrendingUp size={12} className="text-emerald-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-premium dark:shadow-none border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all group cursor-default">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><TrendingUp size={24} /></div>
             <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase ${savingsRate > 20 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300'}`}>
                {savingsRate > 20 ? 'Efficient' : 'Needs Optimization'}
             </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Monthly Surplus</p>
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-1">₹{(savings / 1000).toFixed(1)}k</h3>
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-850">
             <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1.5 font-medium">
                <span>Savings Rate</span>
                <span>{savingsRate.toFixed(0)}%</span>
             </div>
             <div className="w-full h-1 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, savingsRate)}%` }}></div>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-premium dark:shadow-none border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-500 transition-all group cursor-default">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><Target size={24} /></div>
             <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                {profile.riskAppetite}
             </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Saved Goals</p>
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-1">{profile.goals.length} Targets Active</h3>
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between">
             <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-tight">Strategy Node: ON</span>
             <button onClick={() => onLaunchTool('goal_wizard')} className="text-[10px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">Add Goal</button>
          </div>
        </div>
      </div>

      {/* Financial Milestones List */}
      {profile.goals.length > 0 && (
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Target size={14} className="text-brand-500" /> Active Milestones
              </h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.goals.map(goal => (
                <div key={goal.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors shadow-inner">
                         {getGoalIcon(goal.category)}
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[150px]">{goal.name}</h4>
                         <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">{goal.category}</p>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Target</span>
                         <span className="text-lg font-display font-bold text-slate-900 dark:text-white">₹{(goal.targetAmount / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                         <span>Maturity</span>
                         <span className="font-bold">{new Date(goal.targetDate).getFullYear()}</span>
                      </div>
                   </div>
                   <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-slate-300 hover:text-rose-500"><ChevronRight size={18}/></button>
                   </div>
                </div>
              ))}
              <button 
                onClick={() => onLaunchTool('goal_wizard')}
                className="flex flex-col items-center justify-center p-5 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 transition-all text-slate-400 hover:text-brand-500 group"
              >
                <PlusCircle size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Add Milestone</span>
              </button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Insights */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-brand-900 dark:bg-black rounded-[2rem] p-6 text-white flex items-start gap-4 shadow-xl border border-brand-800 dark:border-slate-800 group hover:border-brand-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0"><Zap size={20} className="text-brand-400" /></div>
              <div>
                 <h4 className="text-sm font-bold mb-1">Tax Efficiency Insight</h4>
                 <p className="text-xs text-brand-200/80 dark:text-slate-400 leading-relaxed">Based on your income, opting for the <span className="text-brand-300 font-bold">New Tax Regime</span> could potentially save you <span className="text-brand-300 font-bold">₹24,500</span> annually.</p>
              </div>
           </div>
           <div className="bg-slate-900 dark:bg-black rounded-[2rem] p-6 text-white flex items-start gap-4 shadow-xl border border-slate-800 group hover:border-indigo-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0"><ShieldCheck size={20} className="text-indigo-400" /></div>
              <div>
                 <h4 className="text-sm font-bold mb-1">Safety Buffer Alert</h4>
                 <p className="text-xs text-slate-400 leading-relaxed">Your emergency fund covers <span className="text-indigo-300 font-bold">3.3 months</span>. Aim for <span className="text-indigo-300 font-bold">6 months</span> to achieve "Stable" resilience status.</p>
              </div>
           </div>
        </div>

        {/* Portfolio Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-premium dark:shadow-none border border-slate-100 dark:border-slate-800 relative group overflow-hidden transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h4 className="font-display font-bold text-slate-900 dark:text-white">Portfolio Mix</h4>
               <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mt-1">Asset Distribution</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 hover:text-brand-500 transition-colors cursor-pointer group-hover:rotate-12 duration-500 shadow-sm"><Info size={16} /></div>
          </div>
          <div className="h-72">
            {assetData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={assetData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={80} 
                    outerRadius={105} 
                    paddingAngle={6} 
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: isDarkMode ? '#0a0a0a' : '#fff', borderRadius: '16px', border: isDarkMode ? '1px solid #1a1a1a' : 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }} 
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number) => {
                      const percent = ((value / totalAssetsSum) * 100).toFixed(1);
                      return [`₹${value.toLocaleString()} (${percent}%)`, 'Allocation'];
                    }} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '10px', color: isDarkMode ? '#404040' : '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400 italic font-medium">Context build required...</div>}
          </div>
        </div>

        {/* Cash Flow Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-premium dark:shadow-none border border-slate-100 dark:border-slate-800 group transition-colors">
          <div className="flex items-start justify-between mb-8">
             <div>
                <h4 className="font-display font-bold text-slate-900 dark:text-white">Cash Flow Breakdown</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mt-1">Income Utilization</p>
             </div>
             <div className="text-right">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2.5 py-1.5 rounded-lg border border-brand-100 dark:border-brand-800">
                   <TrendingUp size={12}/> Net Savings Rate
                </div>
                <p className="text-2xl font-display font-bold text-brand-600 dark:text-brand-400 mt-1">{savingsRate.toFixed(1)}%</p>
             </div>
          </div>
          
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedCashflowData} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#1a1a1a' : '#f1f5f9'} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: isDarkMode ? '#0a0a0a' : '#fff', borderRadius: '16px', border: isDarkMode ? '1px solid #1a1a1a' : 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="Expenses" stackId="a" fill="#f43f5e" radius={[12, 0, 0, 12]} barSize={60} animationDuration={2000} />
                <Bar dataKey="Savings" stackId="a" fill="#14b8a6" radius={[0, 12, 12, 0]} barSize={60} animationDuration={2000} />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="flex justify-center gap-8 mt-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#f43f5e]"></div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Expenses (₹{(profile.monthlyExpenses/1000).toFixed(1)}k)</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#14b8a6]"></div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Savings (₹{(savings/1000).toFixed(1)}k)</span>
               </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Inflow</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">₹{profile.monthlyIncome.toLocaleString()}</p>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Surplus Ratio</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">1 : {(profile.monthlyIncome / (savings || 1)).toFixed(1)}</p>
             </div>
          </div>
        </div>

        {/* Wealth Projection Chart */}
        <div className="bg-slate-900 dark:bg-black p-10 rounded-[3rem] shadow-2xl lg:col-span-2 overflow-hidden relative group border border-white/5 transition-colors">
          <div 
            ref={largeCardBlobRef}
            className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-500/5 rounded-full -mr-80 -mt-80 blur-[100px] group-hover:bg-brand-500/10 transition-all duration-1000"
            style={{ willChange: 'transform' }}
          ></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 bg-brand-500/10 px-3 py-1 rounded-full text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-3 border border-brand-500/20 shadow-sm">
                   <Sparkles size={12}/> AI Wealth Projection
                </div>
                <h4 className="font-display font-bold text-white text-3xl tracking-tight">Financial Freedom Roadmap</h4>
                <p className="text-slate-400 text-sm mt-2 max-w-lg">Projected portfolio growth assuming a consistent <span className="text-brand-400 font-bold">{profile.riskAppetite === 'Aggressive' ? '12%' : profile.riskAppetite === 'Moderate' ? '9%' : '6%'} CAGR</span> based on your current savings profile.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-2xl min-w-[200px]">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">10-Year Maturity</p>
                 <p className="text-3xl font-display font-bold text-brand-400">₹{(projectionData[10].wealth / 100000).toFixed(1)}L</p>
                 <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <TrendingUp size={14}/> +{( (projectionData[10].wealth - netWorth) / (netWorth || 1) * 100).toFixed(0)}% Growth
                 </div>
              </div>
            </div>
            
            <div className="h-80 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWealthHero" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: '600' }} dy={12} />
                  <YAxis hide />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', padding: '16px' }} 
                    itemStyle={{ color: '#14b8a6', fontWeight: 'bold', fontSize: '15px' }} 
                    labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold' }} 
                    formatter={(value: number) => [`₹${(value / 100000).toFixed(1)}L`, 'Est. Portfolio']} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wealth" 
                    stroke="#14b8a6" 
                    strokeWidth={5} 
                    fillOpacity={1} 
                    fill="url(#colorWealthHero)" 
                    animationDuration={3000}
                    activeDot={{ r: 10, fill: '#14b8a6', stroke: '#0f172a', strokeWidth: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center gap-4 group/tip hover:bg-white/10 transition-all cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 shadow-sm"><Zap size={18} className="text-amber-400" /></div>
                  <div className="text-xs text-left">
                     <p className="text-white font-bold mb-0.5">SIP Multiplier Effect</p>
                     <p className="text-slate-400">Increasing monthly savings by just <span className="text-white font-bold">10%</span> could add <span className="text-brand-400 font-bold">₹{(projectionData[10].wealth * 0.12 / 100000).toFixed(1)}L</span> to your final goal.</p>
                  </div>
               </div>
               <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center gap-4 group/tip hover:bg-white/10 transition-all cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 shadow-sm"><Calculator size={18} className="text-blue-400" /></div>
                  <div className="text-xs text-left">
                     <p className="text-white font-bold mb-0.5">Inflation Adjuster</p>
                     <p className="text-slate-400">At <span className="text-white font-bold">6% inflation</span>, your current purchasing power will require <span className="text-brand-400 font-bold">₹{(netWorth * 1.8 / 100000).toFixed(1)}L</span> in 10 years.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;