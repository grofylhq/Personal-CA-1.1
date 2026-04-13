
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Content } from "@google/genai";
import { Message, UserProfile, AppView, ChatSession, UserAccount, SubscriptionTier, DraftDocument } from './types';
import { sendMessageToAI, transcribeAudio, resetChatSession, clearChatSession, initializeAI } from './services/aiService';
import { authAPI, userAPI } from './services/database';
import { getSupabaseClient } from './services/supabaseClient';
import ToolsPanel from './components/ToolsPanel';
import NewsPanel from './components/NewsPanel';
import ProfilePanel from './components/ProfilePanel';
import FinancialDashboard from './components/FinancialDashboard';
import AuthScreen from './components/AuthScreen';
import SubscriptionModal from './components/SubscriptionModal';
import GuidedLearningOverlay from './components/GuidedLearningOverlay';
import DocumentCanvas from './components/DocumentCanvas';
import { Logo } from './components/Logo';
import { SUGGESTIONS } from './constants';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { 
  Send, Mic, LayoutGrid, Bell, Bot, User, 
  FileText, Calculator, TrendingUp, 
  ChevronRight, MessageSquare, 
  BarChart3, ShieldCheck, Plus, 
  X, Clock, ChevronLeft, Moon, Sun,
  Paperclip, Shield, Square, PlusCircle, Crown, Loader2, HelpCircle, FilePlus, Zap, Wand2, 
  Library, FolderOpen, ArrowRight, Maximize2, PanelLeftClose, PanelLeft, AlertCircle, Wand,
  Paperclip as PaperclipIcon,
  CircleUser,
  Minimize2,
  AlertTriangle,
  File,
  FileImage,
  FileArchive,
  ExternalLink,
  FileSearch,
  CheckCircle2
} from 'lucide-react';

const ThinkingDots: React.FC = () => (
  <div className="flex gap-1 py-2">
    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }}></span>
    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.1s' }}></span>
    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.2s' }}></span>
  </div>
);

/**
 * SECURITY: Aggressive sanitization logic to prevent XSS and Prototype Pollution.
 * This is called for every rendered message and profile input.
 */
export const secureSanitize = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id']
  });
};

const TypingText: React.FC<{ text: string; isStreaming: boolean; isLast: boolean }> = ({ text, isStreaming, isLast }) => {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isStreaming) { 
      setDisplayedText(text); 
      return; 
    }
    
    // Performance Guard: for extremely long texts
    if (text.length > 50000) {
      setDisplayedText(text);
      return;
    }
    
    if (displayedText.length < text.length) {
      if (!intervalRef.current) {
        intervalRef.current = window.setInterval(() => {
          setDisplayedText((prev) => {
            if (prev.length < text.length) {
              const diff = text.length - prev.length;
              // Adaptive chunking for smoother rendering
              const chunk = diff > 200 ? 50 : diff > 50 ? 10 : 2;
              return text.substring(0, prev.length + chunk);
            }
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
            return prev;
          });
        }, 12);
      }
    } else if (displayedText.length > text.length) { 
      setDisplayedText(text); 
    } else { 
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } 
    }
    
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [text, isStreaming, displayedText.length]);

  const htmlContent = useMemo(() => {
    const rawHTML = displayedText ? marked.parse(displayedText) as string : '';
    return secureSanitize(rawHTML);
  }, [displayedText]);

  return (
    <div 
      className={`prose prose-slate dark:prose-invert max-w-none prose-sm md:prose-base ${isLast && isStreaming ? 'typing-cursor' : ''} selection:bg-brand-100 selection:text-brand-900 break-words overflow-x-auto`} 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

const AnimatedPlaceholder: React.FC = () => {
  const phrases = [
    "Ask about Budget 2024...",
    "Draft a Partnership Deed...",
    "Calculate GST for exports...",
    "NPS vs ELSS comparison..."
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-y-0 left-2 right-14 pointer-events-none overflow-hidden flex items-center">
      <span key={index} className="text-slate-400 text-[11px] md:text-sm italic animate-placeholder-slide whitespace-nowrap block truncate w-full">
        {phrases[index]}
      </span>
    </div>
  );
};

const MAX_FILES = 10;
const MAX_TOTAL_SIZE_MB = 20;

type Todo = {
  id: string;
  name: string;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authAPI.getSession());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(window.innerWidth > 1024); 
  const [showSubscription, setShowSubscription] = useState(false);
  const [showGuidedLearning, setShowGuidedLearning] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeDraft, setActiveDraft] = useState<DraftDocument | null>(null);
  const [isDraftFullscreen, setIsDraftFullscreen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('chat');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [toolData, setToolData] = useState<any>({});
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [hasStarted, setHasStarted] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  const currentModelMsgIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && !activeDraft) setShowHistory(true);
      else if (activeDraft) setShowHistory(false);
      else setShowHistory(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeDraft]);

  useEffect(() => {
    if (currentUser && currentUser.profile.currentSessionId) {
      const session = currentUser.profile.chatSessions.find(s => s.id === currentUser.profile.currentSessionId);
      if (session) {
        setMessages(session.messages);
        setHasStarted(session.messages.length > 0);
        const geminiHistory: Content[] = [];
        session.messages.forEach(m => {
          geminiHistory.push({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }]
          });
        });
        initializeAI(currentUser.profile, geminiHistory);
      }
    }
  }, [currentUser?.profile.currentSessionId]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    async function getTodos() {
      const sb = getSupabaseClient();
      if (!sb) {
        // Gracefully skip optional todos integration when Supabase is not configured.
        return;
      }
      const { data, error } = await sb.from('todos').select('id,name');
      if (error) {
        console.error('Failed to fetch todos:', error.message);
        return;
      }

      if (isMounted && data) {
        setTodos(data as Todo[]);
      }
    }

    getTodos().catch((error) => {
      console.error('Unexpected todo fetch error:', error);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isStreaming, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = (account: UserAccount) => {
    setCurrentUser(account);
    const sessionId = account.profile.currentSessionId;
    if (sessionId) {
       const session = account.profile.chatSessions.find(s => s.id === sessionId);
       if (session) {
          setMessages(session.messages);
          setHasStarted(session.messages.length > 0);
          resetChatSession(account.profile);
          return;
       }
    }
    setMessages([]);
    setHasStarted(false);
  };

  const handleLogout = async () => {
    await authAPI.logout();
    clearChatSession();
    setCurrentUser(null);
    setMessages([]);
    setHasStarted(false);
    setShowProfile(false);
    setActiveDraft(null);
  };

  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, profile: newProfile } : null);
    try { 
      await userAPI.updateProfile(currentUser.id, newProfile); 
    } catch (err) {
      console.error("Profile Sync Error:", err);
    }
  }, [currentUser?.id]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleToolCall = (toolId: string, data: any) => {
    setActiveToolId(toolId);
    setToolData(data);
    setShowTools(true);
  };

  const handleDraftCall = (title: string, content: string, type: string) => {
    const draftId = `draft_${Date.now()}`;
    const newDraft: DraftDocument = { id: draftId, title, content, type, lastUpdated: new Date() };
    setActiveDraft(newDraft);
    if (window.innerWidth < 1280) setShowHistory(false);
    if (currentModelMsgIdRef.current) {
      setMessages(prev => prev.map(m => m.id === currentModelMsgIdRef.current ? { ...m, draft: newDraft } : m));
    }
    if (currentUser) {
      const existingDrafts = currentUser.profile.drafts || [];
      const updatedDrafts = [newDraft, ...existingDrafts].slice(0, 50);
      updateProfile({ ...currentUser.profile, drafts: updatedDrafts });
    }
  };

  const createNewSession = () => {
    if (!currentUser) return;
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = { id: newId, title: 'New Consultation', messages: [], createdAt: new Date(), lastUpdated: new Date() };
    updateProfile({ ...currentUser.profile, chatSessions: [newSession, ...currentUser.profile.chatSessions], currentSessionId: newId });
    setMessages([]); setHasStarted(true); setActiveDraft(null);
    resetChatSession(currentUser.profile);
    if (window.innerWidth < 1024) setShowHistory(false);
  };

  const switchSession = (sessionId: string) => {
    if (!currentUser) return;
    const session = currentUser.profile.chatSessions.find(s => s.id === sessionId);
    if (session) {
      updateProfile({ ...currentUser.profile, currentSessionId: sessionId });
      setMessages(session.messages);
      setHasStarted(session.messages.length > 0);
      setCurrentView('chat');
      if (window.innerWidth < 1024) setShowHistory(false);
      setActiveDraft(null);
      
      const geminiHistory: Content[] = [];
      session.messages.forEach(m => {
        geminiHistory.push({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        });
      });
      initializeAI(currentUser.profile, geminiHistory); 
    }
  };

  const toggleRecording = async () => {
    if (isRecording) { 
      mediaRecorderRef.current?.stop(); 
      setIsRecording(false); 
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder; 
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader(); reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            setIsTranscribing(true);
            try {
               const text = await transcribeAudio(base64String, 'audio/webm');
               if (text) setInput(prev => prev ? `${prev} ${text}`.trim() : text);
            } catch (e) { } finally { setIsTranscribing(false); }
          };
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorder.start(); setIsRecording(true);
      } catch (err) {
        console.error("Mic Access Denied:", err);
      }
    }
  };

  const optimizePrompt = async () => {
    if (!input.trim() || isOptimizing) return;
    setIsOptimizing(true);
    try {
      const result = await sendMessageToAI(
        `Convert this into a formal, high-precision financial query for a Senior CA: "${input}". 
        Be professional, include relevant Indian tax section if applicable. 
        Only return the refined query text.`,
        () => {}, () => {}, currentUser?.profile, undefined, undefined, false, currentUser?.profile.preferredAIProvider || 'openrouter', currentUser?.profile.preferredModel
      );
      if (result.text) {
        const cleaned = result.text.replace(/^["'“”‘«]|["'“”’»]$/g, '').trim();
        setInput(cleaned);
      }
    } catch (e) {} finally { setIsOptimizing(false); }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride !== undefined ? textOverride : input;
    if (textToSend.length > 5000) {
      setFileError("Message too long. Statutory nodes have a 5k character limit.");
      setTimeout(() => setFileError(null), 3000);
      return;
    }

    if (!textToSend.trim() && selectedFiles.length === 0) return;
    if (!currentUser) return;

    const sub = currentUser.profile.subscription || { tier: 'free', messageCount: 0 };
    if (sub.tier === 'free' && sub.messageCount >= 10) { setShowSubscription(true); return; }

    let nextProfile = { ...currentUser.profile };
    let sessionId = nextProfile.currentSessionId;
    nextProfile.subscription = { ...nextProfile.subscription, messageCount: nextProfile.subscription.messageCount + 1 };

    if (!sessionId) {
      sessionId = `session_${Date.now()}`;
      const newSession: ChatSession = { id: sessionId, title: textToSend.slice(0, 30), messages: [], createdAt: new Date(), lastUpdated: new Date() };
      nextProfile.chatSessions = [newSession, ...nextProfile.chatSessions];
      nextProfile.currentSessionId = sessionId;
    }

    if (!hasStarted) setHasStarted(true);
    if (currentView !== 'chat') setCurrentView('chat');

    const attachmentMetadata = selectedFiles.map(f => ({ name: f.name, type: f.type }));
    const userMsg: Message = { 
      id: `u_${Date.now()}`, 
      role: 'user', 
      content: secureSanitize(textToSend), 
      timestamp: new Date(),
      attachments: attachmentMetadata.length > 0 ? attachmentMetadata : undefined
    };
    
    const modelMsgId = `m_${Date.now()}`;
    currentModelMsgIdRef.current = modelMsgId;
    const placeholderMsg: Message = { id: modelMsgId, role: 'model', content: '', timestamp: new Date(), groundingSources: [] };

    setMessages(prev => [...prev, userMsg, placeholderMsg]);
    
    const attachments: { data: string, mimeType: string }[] = [];
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        try {
          const base64 = await fileToBase64(file);
          attachments.push({ data: base64, mimeType: file.type });
        } catch (e) {
          console.error("File processing error", e);
        }
      }
    }

    setInput('');
    setSelectedFiles([]);
    setIsLoading(true); setIsStreaming(true);

    try {
      const finalResponse = await sendMessageToAI(
        textToSend, 
        handleToolCall,
        handleDraftCall,
        nextProfile,
        (streamedText, sources) => {
          setIsLoading(false);
          setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, content: streamedText, groundingSources: sources } : m));
        },
        attachments,
        true,
        nextProfile.preferredAIProvider || 'openrouter',
        nextProfile.preferredModel
      );
      
      const finalModelMsg: Message = { 
        ...placeholderMsg, 
        content: finalResponse.text, 
        groundingSources: finalResponse.sources, 
        timestamp: new Date()
      };
      
      const updatedHistorySessions = nextProfile.chatSessions.map(s => {
        if (s.id === sessionId) {
          const updatedMessages = [...s.messages, userMsg, finalModelMsg];
          return { ...s, messages: updatedMessages, title: s.title === 'New Consultation' ? userMsg.content.slice(0, 30) : s.title, lastUpdated: new Date() };
        }
        return s;
      });
      nextProfile.chatSessions = updatedHistorySessions;
      await updateProfile(nextProfile); 
    } catch (error) {
      setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, content: "⚠️ System connection interrupted. The statutory engine is offline. Please check your network and retry.", isError: true } : m));
    } finally { 
      setIsLoading(false); 
      setIsStreaming(false); 
      currentModelMsgIdRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if ((input.trim() || selectedFiles.length > 0) && !isStreaming && !isTranscribing) { handleSend(); }
    }
  };

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileList = Array.from(files);
    const validFiles = fileList.filter((f: File) => 
      ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'text/csv'].includes(f.type)
    );
    if (validFiles.length !== fileList.length) {
      setFileError("Restricted formats rejected. Allowed: PDF, Images, Text, CSV.");
      setTimeout(() => setFileError(null), 4000);
    }
    const newFiles = [...selectedFiles, ...validFiles].slice(0, MAX_FILES);
    const totalSizeMB = newFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      setFileError(`Payload exceeds ${MAX_TOTAL_SIZE_MB}MB statutory limit.`);
      setTimeout(() => setFileError(null), 4000);
      return;
    }
    setSelectedFiles(newFiles);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;

  const subTier = currentUser.profile.subscription?.tier || 'free';
  const getTierGradient = (tier: SubscriptionTier) => {
    switch(tier) {
      case 'free': return 'from-slate-800 via-slate-900 to-black';
      case 'expert': return 'from-indigo-600 via-brand-600 to-brand-700';
      case 'professional': return 'from-amber-400 via-amber-600 to-black';
      case 'core': return 'from-slate-600 to-slate-800';
      default: return 'from-slate-100 to-slate-300';
    }
  };

  const isCanvasActive = !!activeDraft;

  return (
    <div className="flex h-[100dvh] font-sans text-slate-800 dark:text-slate-200 relative bg-slate-50/30 dark:bg-black overflow-hidden transition-colors duration-300">
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white/95 dark:bg-[#0a0a0a] transform transition-all duration-500 ease-out border-r border-slate-100 dark:border-white/5 backdrop-blur-xl flex flex-col shadow-2xl lg:shadow-none ${showHistory ? 'translate-x-0 w-72 lg:relative opacity-100' : '-translate-x-full w-0 lg:w-0 opacity-0 pointer-events-none'}`}>
        <div className="flex-1 flex flex-col w-72 overflow-hidden">
          <div className="h-[72px] px-6 border-b border-slate-50 dark:border-slate-850 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5" onClick={() => { setMessages([]); setHasStarted(false); setActiveDraft(null); }} style={{cursor: 'pointer'}}>
              <Logo size={28} />
              <h2 className="font-display font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">Personal CA</h2>
            </div>
            <button onClick={() => setShowHistory(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
               <PanelLeftClose size={20} />
            </button>
          </div>
          <div className="p-4">
            <button onClick={createNewSession} className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 dark:text-white text-slate-900 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-md border border-slate-200 dark:border-slate-700 active:scale-[0.98]">
              <Plus size={16} /> New Consultation
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar pb-10">
            <div className="mb-6">
              <h3 className="px-3 mb-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Consultations</h3>
              {[...currentUser.profile.chatSessions].sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map((session) => (
                <button key={session.id} onClick={() => switchSession(session.id)} className={`w-full group flex flex-col p-3 rounded-xl text-left transition-all relative ${currentUser.profile.currentSessionId === session.id ? 'bg-slate-100/80 dark:bg-white/5' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <span className={`text-xs font-bold truncate pr-6 ${currentUser.profile.currentSessionId === session.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}> {session.title} </span>
                  <div className="flex items-center gap-1.5 mt-1 opacity-50">
                    <Clock size={10} />
                    <span className="text-[9px] font-bold"> {new Date(session.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 dark:bg-black/50 border-t border-slate-100 dark:border-white/5 flex flex-col gap-4">
               <button 
                 onClick={() => setShowSubscription(true)}
                 className={`group relative w-full overflow-hidden rounded-2xl p-4 transition-all text-left shadow-lg active:scale-95 bg-gradient-to-br ${getTierGradient(subTier)} hover:scale-[1.02]`}
               >
                 <div className="relative z-10">
                   <div className="flex items-center justify-between mb-1">
                     <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[8px] font-black uppercase tracking-widest border border-white/20 text-white">{subTier.toUpperCase()}</span>
                   </div>
                   <h4 className="text-xs font-black uppercase tracking-tight mb-2 text-white">
                      {subTier === 'free' ? 'Upgrade Node' : 'Premium Profile'}
                   </h4>
                 </div>
               </button>

             <button onClick={() => setShowProfile(true)} className="w-full group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left border border-transparent">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/10 overflow-hidden">
                     {currentUser.profile.avatarUrl ? (
                       <img src={currentUser.profile.avatarUrl} className="w-full h-full object-cover" alt="" />
                     ) : (
                       <Logo size={20} className="opacity-80" />
                     )}
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-none truncate">{currentUser.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Identity Hub</p>
                  </div>
                </div>
             </button>
          </div>
        </div>
      </aside>

      <main className={`flex flex-col relative min-w-0 transition-all duration-500 h-full ${isCanvasActive ? (isDraftFullscreen ? 'md:w-[320px] lg:w-[380px]' : 'md:w-1/2') : 'flex-1'}`}>
          <header className={`fixed top-0 left-0 z-30 h-[72px] transition-all duration-500 ${showHistory ? 'lg:left-72' : 'lg:left-0'} ${hasStarted ? 'bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 shadow-sm' : ''} ${isCanvasActive ? (isDraftFullscreen ? 'md:right-[calc(100%-320px)] lg:right-[calc(100%-380px)]' : 'md:right-1/2') : 'right-0'}`}>
            <div className="h-full w-full flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                {!showHistory && (
                  <button onClick={() => setShowHistory(true)} className="p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"> 
                    <PanelLeft size={20} />
                  </button>
                )}
                {/* Visual Fix: Only show header logo if sidebar is hidden or on small screens to prevent double logo appearance */}
                {(!showHistory || window.innerWidth < 1024) && (
                  <div className="flex items-center gap-2 animate-fade-in">
                      <Logo size={28} />
                      <h1 className="text-xs font-display font-bold text-slate-900 dark:text-white uppercase tracking-widest hidden sm:block">Personal CA</h1>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasStarted && (
                  <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl mr-2 scale-90 sm:scale-100 border border-slate-200 dark:border-white/5">
                    <button onClick={() => setCurrentView('chat')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'chat' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Chat</button>
                    <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'dashboard' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Dash</button>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setShowTools(!showTools)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"><LayoutGrid size={16} /></button>
                  <button onClick={() => setShowNews(!showNews)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"><Bell size={16} /></button>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 w-full max-w-4xl mx-auto overflow-hidden flex flex-col pt-[72px]">
              {!hasStarted ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 animate-fade-in pb-12">
                   <div className="mb-8 relative">
                     <div className="absolute inset-0 bg-brand-400/20 dark:bg-brand-400/10 rounded-full blur-3xl scale-150"></div>
                     <div className="w-24 h-24 relative z-10 animate-float"> <Logo size={96} className="shadow-2xl rounded-3xl" /> </div>
                   </div>
                   <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2 text-center tracking-tight">Personal CA</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-10 text-base font-light">Precision Statutory Financial Engine.</p>
                   <button onClick={() => setHasStarted(true)} className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 dark:text-black px-7 py-3 rounded-2xl font-display font-bold hover:bg-slate-800 shadow-lg uppercase tracking-widest text-xs transition-all">Start Consult <ChevronRight size={16} /></button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden px-4 md:px-10 lg:px-0">
                   {currentView === 'chat' ? (
                     <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-10 py-4 pb-48 custom-scrollbar scroll-smooth">
                        {messages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center animate-fade-in space-y-10">
                            <h2 className="text-xl md:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">How may I advise you?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full px-4">
                              {SUGGESTIONS.map((s, i) => (
                                <button key={i} onClick={() => handleSend(s.prompt)} className="p-4 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl text-left hover:border-brand-300 transition-all duration-300 group">
                                  <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 group-hover:text-brand-600 transition-colors">{s.title}</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{s.description}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          messages.map((msg, idx) => (
                              <div key={msg.id} className={`group flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up relative`}>
                                {msg.role === 'user' ? (
                                  <div className="flex flex-col items-end gap-2 max-w-[85%]">
                                    <div className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-2xl rounded-tr-md shadow-sm text-sm break-words border border-slate-200 dark:border-white/5"> {msg.content} </div>
                                    {msg.attachments && (
                                      <div className="flex flex-wrap justify-end gap-1.5">
                                        {msg.attachments.map((file, fIdx) => (
                                          <div key={fIdx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full shadow-sm">
                                            <div className="text-brand-500">
                                              {file.type.includes('image') ? <FileImage size={10} /> : <FileText size={10} />}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{file.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-full flex gap-3">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-1"> 
                                      <Logo size={22} animate={idx === messages.length - 1 && isLoading && !msg.content} /> 
                                    </div>
                                    <div className="flex-1 max-w-[95%]">
                                       <div className={`rounded-2xl rounded-tl-sm p-1 transition-colors relative group/bubble overflow-hidden break-words ${msg.isError ? 'bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20' : ''}`}>
                                          {msg.role === 'model' && !msg.content && isLoading && idx === messages.length - 1 ? <ThinkingDots /> : (
                                            <div className="flex items-start gap-3">
                                              {msg.isError && <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-1" />}
                                              <TypingText text={msg.content} isStreaming={isStreaming} isLast={idx === messages.length - 1} />
                                            </div>
                                          )}

                                          {/* Sleek Reopen Card for Drafts - Gemini-inspired UI */}
                                          {msg.draft && (
                                            <div className="mt-4 animate-scale-in origin-left max-w-[480px]">
                                              <div className="flex items-center justify-between gap-4 p-4 bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl shadow-inner relative group/draft transition-all hover:bg-slate-100 dark:hover:bg-white/[0.05]">
                                                <div className="flex items-center gap-3 min-w-0">
                                                   <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white/10 text-white dark:text-brand-400 flex items-center justify-center shrink-0 border border-white/5">
                                                      <FileSearch size={20} />
                                                   </div>
                                                   <div className="min-w-0">
                                                      <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate pr-2">{msg.draft.title || 'Drafted Document'}</h4>
                                                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                                        {new Date(msg.draft.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                      </p>
                                                   </div>
                                                </div>
                                                <button 
                                                  onClick={() => {
                                                    if (msg.draft) {
                                                      setActiveDraft(msg.draft);
                                                      if (window.innerWidth < 1024) setIsDraftFullscreen(true);
                                                    }
                                                  }}
                                                  className="shrink-0 px-5 py-2.5 bg-brand-500/20 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-brand-500/30 active:scale-95 transition-all"
                                                >
                                                  Open
                                                </button>
                                              </div>
                                            </div>
                                          )}

                                          {msg.groundingSources && msg.groundingSources.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3"> <Shield size={10} className="text-brand-500" /> Statutory Sources </p>
                                              <div className="flex flex-wrap gap-2"> {msg.groundingSources.map((source, sIdx) => ( <a key={sIdx} href={source.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-brand-50 dark:hover:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-all max-w-full truncate"> {source.title} </a> ))} </div>
                                            </div>
                                          )}
                                       </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                          ))
                        )}
                     </div>
                   ) : (
                     <div className="flex-1 overflow-y-auto custom-scrollbar pb-20"><FinancialDashboard profile={currentUser.profile} onLaunchTool={handleToolCall} /></div>
                   )}
                </div>
              )}

              {hasStarted && currentView === 'chat' && (
                <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 pt-2 bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent">
                   <div className="w-full max-w-2xl mx-auto space-y-4 relative">
                      {/* Active File Previews */}
                      {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-2 animate-fade-in">
                          {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full shadow-sm">
                               <div className="text-brand-500">
                                  {file.type.includes('image') ? <FileImage size={14} /> : <FileText size={14} />}
                               </div>
                               <span className="text-[10px] font-bold truncate max-w-[100px] dark:text-slate-300">{file.name}</span>
                               <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                  <X size={12} />
                                </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {fileError && (
                        <div className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 animate-fade-in">
                          <AlertCircle size={14} /> {fileError}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <div ref={quickActionsRef} className="relative shrink-0">
                          {/* Strategic Options - Refined small size */}
                          <button onClick={() => setShowQuickActions(!showQuickActions)} className={`flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-lg ${showQuickActions ? 'bg-slate-900 text-white dark:bg-white dark:text-black scale-105' : 'bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                            <Plus size={12} className={`mr-1.5 transition-transform duration-300 ${showQuickActions ? 'rotate-45' : ''}`} /> 
                            <span className="whitespace-nowrap">Strategic Options</span>
                          </button>
                          {showQuickActions && (
                            <div className="absolute bottom-full left-0 mb-3 w-64 bg-white dark:bg-[#1a1a1a] border border-slate-100 dark:border-white/10 rounded-[1.75rem] shadow-2xl p-2 z-50 animate-scale-in">
                              <button onClick={() => { setShowGuidedLearning(true); setShowQuickActions(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform"><HelpCircle size={16}/></div>
                                <div><p className="text-xs font-bold text-slate-900 dark:text-white">Pathways</p><p className="text-[9px] text-slate-500">Guided intelligence</p></div>
                              </button>
                              <button onClick={() => { setInput("Draft a professional formal document for... "); setShowQuickActions(false); textareaRef.current?.focus(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform"><FilePlus size={16}/></div>
                                <div><p className="text-xs font-bold text-slate-900 dark:text-white">Statutory Draft</p><p className="text-[9px] text-slate-500">Legal precision</p></div>
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-white/5 my-1 mx-2" />
                              <button onClick={() => { setShowQuickActions(false); setShowTools(true); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Calculator size={16}/></div>
                                <div><p className="text-xs font-bold text-slate-900 dark:text-white">Utilities Matrix</p><p className="text-[9px] text-slate-500">Professional Tools</p></div>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Prompt Optimizer - Refined small size */}
                        <button 
                          onClick={optimizePrompt}
                          disabled={!input.trim() || isOptimizing}
                          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all border shrink-0 shadow-sm ${isOptimizing ? 'bg-amber-500 text-white animate-pulse border-transparent' : 'bg-white dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-amber-400'}`}
                          title="Optimize Prompt"
                        >
                          {isOptimizing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={14} />}
                        </button>
                      </div>

                      <div className="bg-slate-100 dark:bg-[#121212] rounded-[28px] p-2 flex items-center gap-2 shadow-2xl border border-slate-200 dark:border-white/5 transition-all focus-within:ring-2 focus-within:ring-brand-500/20 group">
                          <div className="flex items-center shrink-0">
                            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={onFilesSelected} />
                            <button onClick={() => fileInputRef.current?.click()} className="w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-white/5 transition-all"> <Plus size={22}/> </button>
                          </div>
                          <div className="flex-1 relative min-h-[48px] flex items-center px-2 overflow-hidden">
                             <textarea 
                                ref={textareaRef} 
                                rows={1} 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)} 
                                onKeyDown={handleKeyDown} 
                                disabled={isStreaming || isTranscribing} 
                                placeholder=""
                                className="w-full bg-transparent border-none focus:ring-0 resize-none py-3.5 max-h-[150px] text-sm custom-scrollbar text-slate-900 dark:text-slate-100 z-10 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                             />
                             {!input && <AnimatedPlaceholder />}
                          </div>
                          <div className="flex items-center gap-1.5 px-1 shrink-0">
                            <button onClick={toggleRecording} className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${isRecording ? 'bg-rose-50 text-white animate-pulse' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}> {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={22}/>} </button>
                            <button onClick={() => handleSend()} disabled={(!input.trim() && selectedFiles.length === 0) || isStreaming || isTranscribing} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${((input.trim() || selectedFiles.length > 0) && !isStreaming && !isTranscribing) ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg scale-105 active:scale-95' : 'bg-slate-200 dark:bg-white/5 text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}> {isStreaming ? <Square size={14} fill="currentColor" /> : <Send size={20} />} </button>
                          </div>
                      </div>
                   </div>
                </div>
              )}
          </div>
      </main>

      {activeDraft && (
        <div className={`fixed inset-0 z-50 md:relative md:z-auto animate-slide-up transition-all duration-500 h-full ${isDraftFullscreen ? 'md:w-[calc(100%-320px)] lg:w-[calc(100%-380px)]' : 'md:w-1/2'}`}>
           <DocumentCanvas 
              draft={activeDraft} 
              onClose={() => { setActiveDraft(null); setIsDraftFullscreen(false); }} 
              isFullscreen={isDraftFullscreen}
              onToggleFullscreen={() => setIsDraftFullscreen(!isDraftFullscreen)}
           />
        </div>
      )}

      <ToolsPanel isOpen={showTools} activeToolId={activeToolId} onClose={() => setShowTools(false)} onSelectTool={setActiveToolId} toolData={toolData} profile={currentUser.profile} onUpdateProfile={updateProfile} />
      <NewsPanel isOpen={showNews} onClose={() => setShowNews(false)} profile={currentUser.profile} onAskAboutNews={(news) => handleSend(`Tell me more about: ${news}`)} />
      <ProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} profile={currentUser.profile} onUpdate={updateProfile} theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />
      <SubscriptionModal isOpen={showSubscription} onClose={() => setShowSubscription(false)} profile={currentUser.profile} onUpgrade={(tier) => {
        if (currentUser) {
          const updatedProfile = { ...currentUser.profile, subscription: { ...currentUser.profile.subscription, tier } };
          setCurrentUser({ ...currentUser, profile: updatedProfile });
        }
        setShowSubscription(false);
      }} />
      <GuidedLearningOverlay isOpen={showGuidedLearning} onClose={() => setShowGuidedLearning(false)} onSelectPath={(prompt) => handleSend(prompt)} />
      {showHistory && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden" onClick={() => setShowHistory(false)} />}
    </div>
  );
};

export default App;
