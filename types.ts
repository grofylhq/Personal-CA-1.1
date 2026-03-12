
export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  isError?: boolean;
  groundingSources?: { uri: string; title: string }[];
  draft?: DraftDocument; // Optional reference to a document created in this turn
  attachments?: { name: string; type: string }[]; // Metadata for files sent with this message
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface DraftDocument {
  id: string;
  title: string;
  content: string;
  type: string; // 'Legal', 'Tax', 'Corporate'
  lastUpdated: Date;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  category: 'Retirement' | 'House' | 'Education' | 'Travel' | 'Other';
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: 'Verified' | 'Pending';
}

export type SubscriptionTier = 'free' | 'core' | 'expert' | 'professional';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  messageCount: number;
  expiryDate?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  avatarUrl?: string;
  designation?: string;
  companyName?: string;
  businessAddress?: string;
  industryType?: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  assets: {
    cash: number;
    equity: number;
    realEstate: number;
    emergencyFund: number;
    gold: number;
  };
  liabilities: {
    homeLoan: number;
    personalLoan: number;
    creditCard: number;
  };
  riskAppetite: 'Conservative' | 'Moderate' | 'Aggressive';
  goals: FinancialGoal[];
  investmentPreferences: string[];
  complianceTracks: string[]; 
  documents: DocumentItem[];
  drafts: DraftDocument[];
  linkedAccounts: {
    bankName: string;
    status: 'Connected' | 'Disconnected';
  }[];
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  memoryBank: string; 
  subscription: SubscriptionStatus;
  preferredAIProvider?: AIProvider;
  preferredModel?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  profile: UserProfile;
}

export interface ToolConfig {
  id: string;
  name: string;
  category: 'tax' | 'finance' | 'business' | 'compliance' | 'drafting';
  icon: string;
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  sources?: { uri: string; title: string }[];
  caTake?: string; 
}

export type AppView = 'chat' | 'dashboard';

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'openrouter';

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
}

export interface CalculatorState {
  [key: string]: any;
}
