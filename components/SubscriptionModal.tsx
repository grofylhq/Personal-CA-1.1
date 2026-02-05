import React, { useState } from 'react';
import { Check, Shield, Zap, Crown, Star, X, Loader2 } from 'lucide-react';
import { SubscriptionTier, UserProfile } from '../types';
import { userAPI } from '../services/database';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpgrade: (tier: SubscriptionTier) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, profile, onUpgrade }) => {
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setLoadingTier(tier);
    try {
      await userAPI.upgradeSubscription(profile.id, tier);
      onUpgrade(tier);
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setLoadingTier(null);
    }
  };

  const PlanCard = ({ tier, price, name, features, popular, icon: Icon, color }: any) => {
    const isCurrent = profile.subscription?.tier === tier;
    const isProcessing = loadingTier === tier;

    return (
      <div className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col h-full ${popular ? 'bg-slate-900 text-white border-slate-800 shadow-xl scale-105 z-10' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-brand-300 dark:hover:border-slate-700'}`}>
        {popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
            Most Popular
          </div>
        )}
        
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${popular ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-900'}`}>
          <Icon size={24} className={color} />
        </div>

        <h3 className="text-lg font-display font-bold mb-1">{name}</h3>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-3xl font-bold">₹{price}</span>
          <span className={`text-xs font-bold uppercase tracking-wide ${popular ? 'text-slate-400' : 'text-slate-500'}`}>/mo</span>
        </div>

        <div className="space-y-3 mb-8 flex-1">
          {features.map((feat: string, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <Check size={14} className={`mt-0.5 shrink-0 ${popular ? 'text-brand-400' : 'text-brand-600 dark:text-brand-500'}`} />
              <span className={`text-xs font-medium leading-relaxed ${popular ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>{feat}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => !isCurrent && handleSubscribe(tier)}
          disabled={isCurrent || loadingTier !== null}
          className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
            ${isCurrent 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default' 
              : popular 
                ? 'bg-white text-black hover:bg-slate-100' 
                : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90'
            }
          `}
        >
          {isProcessing ? (
             <Loader2 size={16} className="animate-spin" />
          ) : isCurrent ? (
             "Current Plan"
          ) : (
             "Upgrade Now"
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-slate-50 dark:bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#050505]">
           <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Upgrade your Intelligence</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center max-w-4xl mx-auto">
              <PlanCard 
                tier="core"
                price="89"
                name="Core"
                icon={Shield}
                color="text-slate-500"
                features={[
                  "Unlimited Basic Chat",
                  "Standard Response Speed",
                  "Basic Tax Calculators",
                  "Email Support",
                  "1 User Profile"
                ]}
              />
              
              <PlanCard 
                tier="expert"
                price="99"
                name="Expert"
                icon={Zap}
                color="text-amber-500"
                popular={true}
                features={[
                  "Everything in Core",
                  "Advanced Tax Modeling",
                  "Real-time News Analysis",
                  "Document Analysis (OCR)",
                  "Priority Processing",
                  "Export Reports"
                ]}
              />
              
              <PlanCard 
                tier="professional"
                price="149"
                name="Professional"
                icon={Crown}
                color="text-brand-500"
                features={[
                  "Everything in Expert",
                  "Complex Wealth Forecasting",
                  "Business Valuation Tools",
                  "Dedicated CA Support Agent",
                  "API Access (Beta)",
                  "Multi-Entity Management"
                ]}
              />
           </div>
           
           <div className="mt-10 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                 <Shield size={12} /> Secure Payment Gateway • Cancel Anytime
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;