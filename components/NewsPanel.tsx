
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_NEWS } from '../constants';
import { UserProfile, NewsItem } from '../types';
import { fetchRealTimeIntel } from '../services/aiService';
import { 
  Bell, X, ArrowRight, Rss, Loader2, Sparkles, 
  AlertCircle, Calendar, RefreshCcw, ExternalLink,
  ChevronRight, ShieldCheck, Filter, MessageSquare,
  Zap, CheckCircle2, TrendingUp, Wallet, Shield
} from 'lucide-react';
import { Logo } from './Logo';

interface NewsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onAskAboutNews: (newsTitle: string) => void;
}

interface ProfileInsight {
  id: string;
  type: 'compliance' | 'finance' | 'opportunity' | 'tax';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ isOpen, onClose, profile, onAskAboutNews }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [insights, setInsights] = useState<ProfileInsight[]>([]);

  const categories = ['All', 'Direct Tax', 'Indirect Tax', 'Corporate', 'Markets'];

  useEffect(() => {
    if (isOpen && news.length === 0) {
      handleRefresh();
    }
  }, [isOpen]);

  useEffect(() => {
    generateProfileInsights();
  }, [profile]);

  const handleRefresh = async () => {
    setIsLoading(true);
    const updates = await fetchRealTimeIntel();
    setNews(updates.length > 0 ? updates : MOCK_NEWS);
    setIsLoading(false);
  };

  const generateProfileInsights = () => {
    const list: ProfileInsight[] = [];
    const annualIncome = profile.monthlyIncome * 12;
    const savings = profile.monthlyIncome - profile.monthlyExpenses;
    const assetsTotal = (Object.values(profile.assets) as number[]).reduce((a, b) => a + b, 0);

    // Insight: Tax Threshold
    if (annualIncome > 700000 && annualIncome < 1500000) {
      list.push({
        id: 'i1',
        type: 'tax',
        title: 'New Regime Advantage',
        description: 'Your income slab may benefit more from the New Regime statutory changes.',
        icon: <Shield size={14}/>,
        color: 'text-rose-500'
      });
    }

    // Insight: High Savings Deployment
    if (savings > (profile.monthlyIncome * 0.4)) {
      list.push({
        id: 'i2',
        type: 'finance',
        title: 'Surplus Deployment',
        description: 'You have a high surplus ratio. Consider shifting idle cash into index-tracking assets.',
        icon: <TrendingUp size={14}/>,
        color: 'text-emerald-500'
      });
    }

    // Insight: Emergency Fund
    const monthsCoverage = profile.assets.emergencyFund / (profile.monthlyExpenses || 1);
    if (monthsCoverage < 6) {
      list.push({
        id: 'i3',
        type: 'opportunity',
        title: 'Reserve Hardening',
        description: `Current buffer covers ${monthsCoverage.toFixed(1)} months. Aim for 6 months for stability.`,
        icon: <Zap size={14}/>,
        color: 'text-amber-500'
      });
    }

    // Insight: Entity Tracks
    if (profile.complianceTracks.includes('GST')) {
      list.push({
        id: 'i4',
        type: 'compliance',
        title: 'GST Reconciliation',
        description: 'Ensure GSTR-2B vs 3B matches monthly to avoid statutory interest penalties.',
        icon: <CheckCircle2 size={14}/>,
        color: 'text-indigo-500'
      });
    }

    setInsights(list);
  };

  const filteredNews = useMemo(() => {
    if (activeCategory === 'All') return news;
    return news.filter(item => item.category === activeCategory);
  }, [news, activeCategory]);

  const handleCycleCategory = () => {
    const nextIdx = (categories.indexOf(activeCategory) + 1) % categories.length;
    setActiveCategory(categories[nextIdx]);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/10 dark:bg-black/60 backdrop-blur-[2px] z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white dark:bg-[#050505] shadow-2xl transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col bg-white dark:bg-[#050505] transition-colors">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-white/5">
                <Logo size={28} />
              </div>
              <div>
                <h2 className="font-display font-black text-slate-900 dark:text-white text-lg leading-tight uppercase tracking-tighter">Intel Hub</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] leading-none">Statutory Stream Active</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all disabled:opacity-50"
              >
                <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
            {/* Functional Profile Insights Section */}
            <section className="px-6 mt-8 space-y-5">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                    <Zap size={14} /> Profile Insights
                  </h3>
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{insights.length} Found</span>
               </div>
               <div className="space-y-3">
                  {insights.map(insight => (
                    <div key={insight.id} className="p-4 rounded-[1.75rem] bg-slate-50/50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-brand-500/30 transition-all group">
                      <div className="flex gap-4 items-start">
                         <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-black border border-slate-100 dark:border-white/5 shadow-sm ${insight.color}`}>
                            {insight.icon}
                         </div>
                         <div className="flex-1">
                            <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1">{insight.title}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{insight.description}</p>
                         </div>
                      </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* Regulatory Feed with functional Filter */}
            <section className="mt-12 px-6">
              <div className="flex items-center justify-between px-1 mb-5">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 flex items-center gap-2">
                   <Rss size={14} /> Intelligence Stream
                 </h3>
                 <button 
                   onClick={handleCycleCategory}
                   className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-brand-500 border border-transparent hover:border-brand-500/30 transition-all"
                   title="Cycle Categories"
                 >
                    <Filter size={14}/>
                 </button>
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
                 {categories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-white/5 hover:border-brand-500/30'}`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>

              <div className="space-y-6">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-48 rounded-[2rem] bg-slate-50 dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
                  ))
                ) : filteredNews.length > 0 ? (
                  filteredNews.map((item, idx) => (
                    <div key={item.id} className="group animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a] hover:border-brand-500/30 transition-all duration-500 relative overflow-hidden">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-50 dark:bg-brand-950/20 px-2.5 py-1 rounded-lg border border-brand-100 dark:border-brand-900/30">{item.category}</span>
                               <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg uppercase tracking-widest">{item.date}</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${item.impactLevel === 'High' ? 'bg-rose-500 shadow-glow-sm' : item.impactLevel === 'Medium' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                         </div>
                         
                         <h4 className="font-display font-black text-slate-900 dark:text-white text-base mb-3 leading-snug tracking-tight">{item.title}</h4>
                         <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium mb-6">{item.summary}</p>
                         
                         <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-white/5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact: <span className={item.impactLevel === 'High' ? 'text-rose-500' : item.impactLevel === 'Medium' ? 'text-amber-500' : 'text-slate-500'}>{item.impactLevel}</span></span>
                            <button 
                               onClick={() => onAskAboutNews(item.title)}
                               className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-md active:scale-95"
                            >
                               Consult AI <MessageSquare size={14} />
                            </button>
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center">
                     <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 text-slate-200 dark:text-slate-800">
                        <Rss size={32} />
                     </div>
                     <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No updates found for {activeCategory}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsPanel;
