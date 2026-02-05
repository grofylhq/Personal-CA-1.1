
import React from 'react';
import { X, Sparkles, ShieldCheck, TrendingUp, Landmark, Zap, ArrowRight, ChevronRight, HelpCircle } from 'lucide-react';
import { GUIDED_PATHS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPath: (prompt: string) => void;
}

const GuidedLearningOverlay: React.FC<Props> = ({ isOpen, onClose, onSelectPath }) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className={className} size={24} />;
      case 'TrendingUp': return <TrendingUp className={className} size={24} />;
      case 'Landmark': return <Landmark className={className} size={24} />;
      case 'Zap': return <Zap className={className} size={24} />;
      default: return <Sparkles className={className} size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-10 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#050505] shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <HelpCircle size={28} />
             </div>
             <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Guided Learning</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Select a path to master your financial destiny.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GUIDED_PATHS.map((path, idx) => (
              <button
                key={path.id}
                onClick={() => {
                  onSelectPath(path.prompt);
                  onClose();
                }}
                className="group relative flex flex-col text-left p-6 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-transparent hover:border-brand-500/50 hover:shadow-premium transition-all duration-500 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${path.color} opacity-[0.03] group-hover:opacity-[0.08] rounded-full -mr-16 -mt-16 transition-opacity duration-500`} />
                
                <div className="flex items-center gap-4 mb-4 relative z-10">
                   <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      {getIcon(path.icon, "text-white")}
                   </div>
                   <div>
                      <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg tracking-tight">{path.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{path.subtitle}</p>
                   </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-6 relative z-10 pr-4">
                  Deploy a deep-dive consultation focused on {path.title.toLowerCase()} and strategic growth.
                </p>

                <div className="mt-auto flex items-center justify-between relative z-10 pt-4 border-t border-slate-100 dark:border-white/5">
                   <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest flex items-center gap-1">
                      Start Module <ChevronRight size={12} />
                   </span>
                   <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all">
                      <ArrowRight size={16} />
                   </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group border border-white/5">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                <Sparkles size={120} />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                   <h4 className="text-xl font-display font-bold mb-2">Can't find what you need?</h4>
                   <p className="text-sm text-slate-400 font-medium">Ask Personal CA directly for a custom learning path tailored to your specific situation.</p>
                </div>
                <button 
                  onClick={() => {
                    onSelectPath("Help me create a customized learning path for my financial profile.");
                    onClose();
                  }}
                  className="px-8 py-3.5 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                   Custom Guide
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedLearningOverlay;
