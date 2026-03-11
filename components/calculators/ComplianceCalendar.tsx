
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, AlertTriangle, Settings2, ShieldCheck, Check, X, Info, Zap, Building2, Briefcase, Landmark } from 'lucide-react';
import { UserProfile } from '../../types';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

interface TrackDef {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const TRACKS: TrackDef[] = [
  { id: 'Income Tax', name: 'Income Tax', icon: <Landmark size={14}/>, color: 'text-blue-500' },
  { id: 'GST', name: 'GST Registered', icon: <ShieldCheck size={14}/>, color: 'text-brand-500' },
  { id: 'ROC', name: 'ROC (Pvt Ltd/LLP)', icon: <Building2 size={14}/>, color: 'text-indigo-500' },
  { id: 'PF/ESI', name: 'Employer (PF/ESI)', icon: <Briefcase size={14}/>, color: 'text-rose-500' },
  { id: 'MSME', name: 'MSME Registered', icon: <Zap size={14}/>, color: 'text-amber-500' },
];

const ComplianceCalendar: React.FC<Props> = ({ profile, onUpdateProfile }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);

  const allEvents = useMemo(() => [
    { date: '07 Oct', title: 'TDS/TCS Deposit', cat: 'Income Tax', priority: 'High' },
    { date: '11 Oct', title: 'GSTR-1 Filing', cat: 'GST', priority: 'Medium' },
    { date: '15 Oct', title: 'IT Audit Report Filing', cat: 'Income Tax', priority: 'High' },
    { date: '15 Oct', title: 'PF & ESI Contribution', cat: 'PF/ESI', priority: 'High' },
    { date: '20 Oct', title: 'GSTR-3B Payment', cat: 'GST', priority: 'High' },
    { date: '30 Oct', title: 'ROC Form MGT-7', cat: 'ROC', priority: 'Low' },
    { date: '31 Oct', title: 'Income Tax Return (Audit)', cat: 'Income Tax', priority: 'High' },
    { date: '15 Nov', title: 'MSME-1 Half Yearly Return', cat: 'MSME', priority: 'Medium' },
    { date: '30 Nov', title: 'ROC Form AOC-4', cat: 'ROC', priority: 'High' },
  ], []);

  const filteredEvents = useMemo(() => {
    const tracks = profile.complianceTracks || [];
    return allEvents.filter(ev => tracks.includes(ev.cat));
  }, [allEvents, profile.complianceTracks]);

  const toggleTrack = (trackId: string) => {
    const current = profile.complianceTracks || [];
    const updated = current.includes(trackId)
      ? current.filter(id => id !== trackId)
      : [...current, trackId];
    
    onUpdateProfile({
      ...profile,
      complianceTracks: updated
    });
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
         <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white uppercase tracking-tight">Statutory Timeline</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Personalized Regulatory Grid</p>
         </div>
         <button 
           onClick={() => setIsConfiguring(!isConfiguring)}
           className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isConfiguring ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-lg scale-110' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-brand-500'}`}
         >
            {isConfiguring ? <Check size={20} /> : <Settings2 size={20} />}
         </button>
      </div>

      {isConfiguring ? (
        <div className="space-y-4 animate-fade-in">
           <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30 p-4 rounded-2xl flex items-start gap-3">
              <Info size={18} className="text-brand-600 dark:text-brand-400 mt-0.5" />
              <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed font-medium">Select the regulatory tracks relevant to your entity. We'll build your personalized compliance roadmap based on these selections.</p>
           </div>
           
           <div className="grid gap-3">
              {TRACKS.map(track => {
                const isActive = profile.complianceTracks.includes(track.id);
                return (
                  <button
                    key={track.id}
                    onClick={() => toggleTrack(track.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${isActive ? 'bg-white dark:bg-slate-900 border-brand-200 dark:border-brand-800 shadow-sm' : 'bg-slate-50/50 dark:bg-black/20 border-transparent opacity-60'}`}
                  >
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center transition-colors ${isActive ? track.color : 'text-slate-400'}`}>
                          {track.icon}
                       </div>
                       <div className="text-left">
                          <p className={`text-sm font-bold transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{track.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{isActive ? 'Track Active' : 'Off Track'}</p>
                       </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-1 transition-all ${isActive ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </button>
                );
              })}
           </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             {profile.complianceTracks.map(id => (
               <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-brand-500"></div> {id}
               </span>
             ))}
          </div>

          <div className="space-y-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((ev, i) => (
                <div key={i} className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-850 hover:shadow-premium dark:hover:shadow-none border border-transparent dark:border-slate-800 hover:border-slate-100 transition-all cursor-default animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                   <div className="flex items-center gap-4">
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-sm text-center min-w-[56px]">
                         <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{ev.date.split(' ')[1]}</p>
                         <p className="text-lg font-display font-bold text-slate-900 dark:text-white leading-none">{ev.date.split(' ')[0]}</p>
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{ev.cat}</span>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${ev.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                              {ev.priority}
                            </span>
                         </div>
                         <h4 className="font-display font-bold text-slate-800 dark:text-white text-[15px]">{ev.title}</h4>
                      </div>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                         <Clock size={16} />
                      </button>
                   </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                 <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-200 dark:text-slate-800">
                    <Calendar size={32} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Timeline Empty</p>
                    <button onClick={() => setIsConfiguring(true)} className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-2 underline">Configure Tracks</button>
                 </div>
              </div>
            )}
          </div>

          {filteredEvents.some(e => e.priority === 'High') && (
            <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 border dark:border-slate-800 text-white flex gap-4 items-center transition-colors animate-pulse-slow">
               <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 flex-shrink-0">
                  <AlertTriangle size={20} />
               </div>
               <div>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Urgent Notification</p>
                  <p className="text-sm text-slate-300 dark:text-slate-400">High priority statutory deadlines detected in your active tracks. Ensure all reconciliations are complete.</p>
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComplianceCalendar;
