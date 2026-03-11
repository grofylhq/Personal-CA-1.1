
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { X, FileText, Download, Printer, Sparkles, ChevronDown, ExternalLink } from 'lucide-react';
import { marked } from 'marked';
import { DraftDocument } from '../types';
import { secureSanitize } from '../App';

interface Props {
  draft: DraftDocument;
  onClose: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const DocumentCanvas: React.FC<Props> = ({ draft, onClose, isFullscreen, onToggleFullscreen }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    // Use window.document explicitly to prevent any shadowing issues
    window.document.addEventListener('mousedown', handleClickOutside);
    return () => window.document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const htmlContent = useMemo(() => {
    if (!draft?.content) return '';
    marked.setOptions({ gfm: true, breaks: true });
    const rawHTML = marked.parse(draft.content) as string;
    return secureSanitize(rawHTML);
  }, [draft?.content]);

  const handlePrint = () => {
    setShowExportMenu(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportWord = () => {
    if (!draft) return;
    setShowExportMenu(false);
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export</title><style>body { font-family: 'Times New Roman', serif; padding: 40px; }</style></head><body>";
    const footer = "</body></html>";
    const formattedContent = draft.content.replace(/\n/g, '<br/>');
    const sourceHTML = header + formattedContent + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = window.document.createElement("a");
    window.document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${draft.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.doc`;
    fileDownload.click();
    window.document.body.removeChild(fileDownload);
  };

  if (!draft) return null;

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-black border-l border-slate-200 dark:border-white/5 animate-fade-in relative overflow-hidden transition-colors duration-500">
      {/* Visual Top Bar */}
      <div className="h-[72px] flex items-center justify-between px-4 md:px-6 bg-white dark:bg-black border-b border-slate-100 dark:border-white/5 z-[60] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden flex-1 mr-4">
           <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 border border-brand-500/20">
              <FileText size={22} />
           </div>
           <div className="min-w-0">
             <div className="flex items-center gap-2 mb-0.5 min-w-0">
               <h2 className="text-sm md:text-base font-display font-black text-slate-900 dark:text-white uppercase tracking-tight truncate leading-tight flex-1 min-w-0" title={draft.title}>
                 {draft.title}
               </h2>
               <span className="shrink-0 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-white/10">
                 {draft.type}
               </span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles size={10} className="animate-pulse" /> COMPLIANCE VALIDATED
               </span>
             </div>
           </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="relative" ref={exportMenuRef}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-white text-slate-900 dark:text-black flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-sm transition-all border border-slate-200 dark:border-transparent"
            >
              Export <ChevronDown size={14} className={`transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[70] animate-scale-in">
                <button onClick={handleExportWord} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Download size={16}/></div>
                  <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">MS Word</span>
                </button>
                <button onClick={handlePrint} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Printer size={16}/></div>
                  <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">PDF / Print</span>
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#1a1111] text-slate-500 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-slate-200 dark:border-rose-500/20"
          >
             <X size={20} />
          </button>
        </div>
      </div>

      {/* Drafting Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 md:p-8 print:p-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#0c0c0c] min-h-[1000px] shadow-2xl dark:shadow-none border border-slate-100 dark:border-white/5 rounded-3xl overflow-hidden print:border-none print:shadow-none print:rounded-none transition-colors duration-500">
            
            <div className="h-2 bg-gradient-to-r from-brand-600 via-indigo-500 to-brand-600" />
            
            <div className="p-6 sm:p-10 md:p-14 lg:p-16 print:p-0">
               {/* Professional Metadata Header */}
               <div className="mb-16 border-b border-slate-100 dark:border-white/5 pb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="space-y-4">
                     <p className="text-[11px] font-black text-brand-500 dark:text-brand-400 uppercase tracking-[0.5em] leading-none">PERSONAL CA SYNTHESIZED DRAFT</p>
                     <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-900 text-white dark:bg-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-800 dark:border-transparent">LEGALLY INFORMED</span>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">CONFIDENTIAL</p>
                     </div>
                  </div>
                  <div className="md:text-right space-y-2 shrink-0">
                     <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REF: {draft.id.toUpperCase()}</p>
                  </div>
               </div>

              {/* Content Area */}
              <div className="overflow-x-auto max-w-full custom-scrollbar-horizontal pb-8">
                <article 
                  className="prose prose-slate dark:prose-invert max-w-none 
                    prose-headings:font-display prose-headings:font-black prose-headings:text-slate-950 dark:prose-headings:text-white prose-headings:uppercase prose-headings:tracking-tight
                    prose-p:leading-[2] prose-p:text-slate-800 dark:prose-p:text-slate-300 prose-p:mb-10 prose-p:text-lg
                    prose-strong:text-slate-950 dark:prose-strong:text-white prose-strong:font-black
                    prose-li:text-slate-800 dark:prose-li:text-slate-300 prose-li:mb-3 prose-li:text-lg
                    font-serif selection:bg-brand-100 dark:selection:bg-brand-500/30"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>

              {/* Execution Area */}
              <div className="mt-40 pt-16 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-24">
                 <div className="space-y-16">
                    <div className="h-px bg-slate-200 dark:bg-white/10 w-full" />
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">SYSTEM ATTESTATION</p>
                       <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">NODE VERIFIED • {draft.id.split('_')[0]}</p>
                    </div>
                 </div>
                 <div className="space-y-16">
                    <div className="h-px bg-slate-200 dark:bg-white/10 w-full" />
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">AUTHORIZED SIGNATORY</p>
                       <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">[ENTITY EXECUTION]</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Warning Block */}
          <div className="mt-16 pb-24 flex items-start gap-6 px-4 md:px-0 opacity-80">
             <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0 shadow-inner border border-slate-200 dark:border-white/5">
                <FileText size={20} />
             </div>
             <div className="space-y-2">
                <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Statutory Disclaimer</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed italic max-w-3xl font-medium">
                  This document is an AI-generated synthesis based on current statutory templates and user inputs. It is for strategic review and draft purposes. Formal execution should follow professional audit or legal vetting to ensure alignment with jurisdictional specificities.
                </p>
             </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, aside, .no-print, button, .z-10, .z-20, .fixed, .h-\\[72px\\] { display: none !important; }
          .h-full { height: auto !important; overflow: visible !important; }
          .flex-1 { overflow: visible !important; }
          body { background: white !important; padding: 0 !important; color: black !important; }
          .prose { font-size: 12pt !important; color: black !important; line-height: 1.6 !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
          .shadow-none { box-shadow: none !important; }
          .border { border: none !important; }
          .rounded-3xl { border-radius: 0 !important; }
          article { font-family: 'Times New Roman', Times, serif !important; }
          .print\\:p-0 { padding: 0 !important; }
        }
        
        .font-serif {
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        }

        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 6px;
        }
      `}} />
    </div>
  );
};

export default DocumentCanvas;
