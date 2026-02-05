
import React from 'react';
import { TOOLS } from '../constants';
import { 
  Calculator, TrendingUp, FileText, Activity, Calendar, 
  X, ArrowRight, Home, Percent, Coins, PieChart, BarChart2, TrendingDown, Scale, ChevronLeft, Lock, Landmark, ShieldCheck, Target
} from 'lucide-react';
import GSTCalculator from './calculators/GSTCalculator';
import SIPCalculator from './calculators/SIPCalculator';
import IncomeTaxEstimator from './calculators/IncomeTaxEstimator';
import HRACalculator from './calculators/HRACalculator';
import LoanEMICalculator from './calculators/LoanEMI';
import StartupRunway from './calculators/StartupRunway';
import CAGRCalculator from './calculators/CAGRCalculator';
import MarginCalculator from './calculators/MarginCalculator';
import BreakEvenCalculator from './calculators/BreakEvenCalculator';
import InflationCalculator from './calculators/InflationCalculator';
import ComplianceCalendar from './calculators/ComplianceCalendar';
import CapitalGainsCalculator from './calculators/CapitalGainsCalculator';
import NPSCalculator from './calculators/NPSCalculator';
import GratuityCalculator from './calculators/GratuityCalculator';
import FDCalculator from './calculators/FDCalculator';
import ELSSCalculator from './calculators/ELSSCalculator';
import GoalWizard from './calculators/GoalWizard';
import { Logo } from './Logo';
import { UserProfile } from '../types';

interface ToolsPanelProps {
  isOpen: boolean;
  activeToolId: string | null;
  onClose: () => void;
  onSelectTool: (id: string) => void;
  toolData: any;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ isOpen, activeToolId, onClose, onSelectTool, toolData, profile, onUpdateProfile }) => {
  const getIcon = (iconName: string, active: boolean) => {
    const props = { 
      size: 20, 
      className: `transition-colors duration-300 ${active ? 'text-brand-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400'}` 
    };
    
    switch (iconName) {
      case 'Calculator': return <Calculator {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'Activity': return <Activity {...props} />;
      case 'Calendar': return <Calendar {...props} />;
      case 'Home': return <Home {...props} />;
      case 'Percent': return <Percent {...props} />;
      case 'Coins': return <Coins {...props} />;
      case 'PieChart': return <PieChart {...props} />;
      case 'BarChart2': return <BarChart2 {...props} />;
      case 'TrendingDown': return <TrendingDown {...props} />;
      case 'Scale': return <Scale {...props} />;
      case 'Lock': return <Lock {...props} />;
      case 'Landmark': return <Landmark {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Target': return <Target {...props} />;
      default: return <Calculator {...props} />;
    }
  };

  const renderActiveTool = () => {
    switch (activeToolId) {
      case 'gst_calculator': return <GSTCalculator initialData={toolData} />;
      case 'sip_planner': return <SIPCalculator initialData={toolData} />;
      case 'income_tax_estimator': return <IncomeTaxEstimator initialData={toolData} />;
      case 'hra_calculator': return <HRACalculator initialData={toolData} />;
      case 'loan_emi': return <LoanEMICalculator initialData={toolData} />;
      case 'startup_runway': return <StartupRunway initialData={toolData} />;
      case 'cagr_calculator': return <CAGRCalculator initialData={toolData} />;
      case 'margin_calculator': return <MarginCalculator initialData={toolData} />;
      case 'break_even': return <BreakEvenCalculator initialData={toolData} />;
      case 'inflation_calculator': return <InflationCalculator initialData={toolData} />;
      case 'compliance_calendar': return <ComplianceCalendar profile={profile} onUpdateProfile={onUpdateProfile} />;
      case 'capital_gains_calculator': return <CapitalGainsCalculator initialData={toolData} />;
      case 'nps_calculator': return <NPSCalculator initialData={toolData} />;
      case 'gratuity_calculator': return <GratuityCalculator initialData={toolData} />;
      case 'fd_calculator': return <FDCalculator initialData={toolData} />;
      case 'elss_calculator': return <ELSSCalculator initialData={toolData} />;
      case 'goal_wizard': return <GoalWizard profile={profile} onUpdateProfile={onUpdateProfile} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center px-6 animate-fade-in">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center mb-6 shadow-inner text-slate-300 dark:text-slate-600">
               <Calculator size={40} />
            </div>
            <h3 className="text-lg font-display font-bold text-slate-800 dark:text-white mb-2">Interface Pending</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[250px] leading-relaxed">
              The {TOOLS.find(t => t.id === activeToolId)?.name} interface is currently under development.
            </p>
          </div>
        );
    }
  };

  const categories = Array.from(new Set(TOOLS.map(t => t.category)));

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/10 dark:bg-black/60 backdrop-blur-[2px] z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[500px] bg-white dark:bg-black shadow-2xl transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col bg-white dark:bg-black transition-colors">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {activeToolId ? (
                <button 
                  onClick={() => onSelectTool('')} 
                  className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <Logo size={40} className="shadow-lg rounded-xl" />
              )}
              
              <div>
                <h2 className="font-display font-bold text-slate-900 dark:text-white text-lg leading-tight uppercase tracking-tight">
                  {activeToolId ? TOOLS.find(t => t.id === activeToolId)?.name : 'Financial Tools'}
                </h2>
                {!activeToolId && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select a utility to begin</p>}
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeToolId ? (
              <div className="p-6 md:p-8">
                {renderActiveTool()}
              </div>
            ) : (
              <div className="p-6 pb-20 space-y-10">
                {categories.map((cat, idx) => (
                  <div key={cat} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-4 px-2">
                      {cat.replace('_', ' ')}
                    </h3>
                    
                    <div className="space-y-3">
                      {TOOLS.filter(t => t.category === cat).map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => onSelectTool(tool.id)}
                          className="w-full flex items-center p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-transparent hover:bg-white dark:hover:bg-slate-850 hover:border-slate-100 dark:hover:border-slate-800 hover:shadow-premium dark:hover:shadow-none transition-all duration-300 group text-left relative overflow-hidden"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                            {getIcon(tool.icon, false)}
                          </div>
                          
                          <div className="ml-4 flex-1">
                            <h4 className="font-display font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{tool.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{tool.description}</p>
                          </div>
                          
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                             <ArrowRight size={14} className="text-slate-600 dark:text-slate-300" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolsPanel;
