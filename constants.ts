
import { ToolConfig, NewsItem, AIModelConfig, AIProvider } from './types';

export const TOOLS: ToolConfig[] = [
  // Tax Tools
  {
    id: 'gst_calculator',
    name: 'GST Calculator',
    category: 'tax',
    icon: 'Calculator',
    description: 'Calculate GST inclusive/exclusive amounts and tax components.'
  },
  {
    id: 'income_tax_estimator',
    name: 'Tax Estimator',
    category: 'tax',
    icon: 'FileText',
    description: 'Estimate income tax liability for FY 24-25 (Budget 2024).'
  },
  {
    id: 'capital_gains_calculator',
    name: 'Capital Gains (New)',
    category: 'tax',
    icon: 'TrendingUp',
    description: 'Assess STCG/LTCG as per Budget 2024 (12.5% vs 20%).'
  },
  {
    id: 'hra_calculator',
    name: 'HRA Exemption',
    category: 'tax',
    icon: 'Home',
    description: 'Calculate taxable and exempt House Rent Allowance components.'
  },
  {
    id: 'elss_calculator',
    name: 'ELSS Tax Saver',
    category: 'tax',
    icon: 'ShieldCheck',
    description: 'Evaluate tax-saving mutual funds under Section 80C.'
  },

  // Finance Tools
  {
    id: 'goal_wizard',
    name: 'Goal Architect',
    category: 'finance',
    icon: 'Target',
    description: 'Build a roadmap for major milestones like Retirement or Housing.'
  },
  {
    id: 'sip_planner',
    name: 'Wealth Architect',
    category: 'finance',
    icon: 'TrendingUp',
    description: 'Project future corpus growth with inflation adjustment.'
  },
  {
    id: 'nps_calculator',
    name: 'NPS Planner',
    category: 'finance',
    icon: 'Lock',
    description: 'Strategic retirement planning with 80CCD tax benefits.'
  },
  {
    id: 'fd_calculator',
    name: 'FD Analytics',
    category: 'finance',
    icon: 'Landmark',
    description: 'Detailed interest computation for fixed deposits.'
  },
  {
    id: 'loan_emi',
    name: 'Loan Analytics',
    category: 'finance',
    icon: 'Percent',
    description: 'Analyze principal vs interest components of loan repayments.'
  },
  {
    id: 'gratuity_calculator',
    name: 'Gratuity Computation',
    category: 'finance',
    icon: 'Coins',
    description: 'Calculate gratuity payout as per statutory 15/26 rule.'
  },

  // Business Tools
  {
    id: 'startup_runway',
    name: 'Burn & Runway',
    category: 'business',
    icon: 'Activity',
    description: 'Calculate cash runway and operational burn rate metrics.'
  },
  {
    id: 'margin_calculator',
    name: 'Margin & Markup',
    category: 'business',
    icon: 'PieChart',
    description: 'Calculate gross profit margins and unit economics.'
  },
  {
    id: 'break_even',
    name: 'Break-Even Analysis',
    category: 'business',
    icon: 'Scale',
    description: 'Determine sales volume required for profitability.'
  },
  
  // Compliance
  {
    id: 'compliance_calendar',
    name: 'Regulatory Grid',
    category: 'compliance',
    icon: 'Calendar',
    description: 'Track critical MCA, GST, and Income Tax statutory deadlines.'
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'GST Council Proposes Threshold Adjustments',
    category: 'Indirect Tax',
    date: 'Recent',
    summary: 'New proposals aim to simplify compliance for small-scale exporters through enhanced digitisation.',
    impactLevel: 'High'
  },
  {
    id: '2',
    title: 'MCA V3 Portal Update',
    category: 'Corporate Law',
    date: 'Recent',
    summary: 'Key updates in filing procedures for annual returns and financial statements announced by the Ministry.',
    impactLevel: 'Medium'
  }
];

export const SUGGESTIONS = [
  {
    title: 'Budget 2024 CG',
    description: 'Assess impact of 12.5% LTCG rate.',
    icon: 'TrendingUp',
    prompt: 'Calculate the LTCG on a property sold for ₹1.2Cr which was bought for ₹45L in 2010. Use the new 2024 rates.'
  },
  {
    title: 'Entity Selection',
    description: 'Compare LLP vs Private Limited.',
    icon: 'FileText',
    prompt: 'Compare LLP and Private Limited companies for a software startup in terms of taxation and compliance burden.'
  },
  {
    title: 'Fundraising Readiness',
    description: 'Check audit/compliance status.',
    icon: 'ShieldCheck',
    prompt: 'What are the mandatory compliance requirements for a company planning for Seed stage fundraising in India?'
  },
  {
    title: 'NPS vs Equity',
    description: 'Retirement strategy comparison.',
    icon: 'Lock',
    prompt: 'Compare NPS Tier-I vs direct Equity investment for a 30-year-old in the 30% tax bracket.'
  }
];

export const GUIDED_PATHS = [
  {
    id: 'tax_mastery',
    title: 'Tax Optimization',
    subtitle: 'Learn New vs Old Regime',
    icon: 'ShieldCheck',
    color: 'from-brand-500 to-emerald-500',
    prompt: 'I want to master my tax planning. Can you explain the detailed differences between the New and Old Tax Regimes for FY 24-25, specifically for someone with my income profile, and recommend which one offers better statutory benefits?'
  },
  {
    id: 'wealth_builder',
    title: 'Wealth Engineering',
    subtitle: 'Compound Growth Secrets',
    icon: 'TrendingUp',
    color: 'from-indigo-500 to-purple-500',
    prompt: 'Guide me on building long-term wealth. Based on my current assets and risk appetite, what should my ideal asset allocation look like to beat inflation by at least 3%? Also, explain the role of ELSS and NPS in this strategy.'
  },
  {
    id: 'compliance_pro',
    title: 'Entity Compliance',
    subtitle: 'ROC, GST & Audit Ready',
    icon: 'Landmark',
    color: 'from-amber-500 to-orange-500',
    prompt: 'I need a clear roadmap for my business compliance. What are the critical ROC, GST, and Income Tax filing deadlines for my entity type in the next 6 months? Help me understand the penalties for non-compliance under Section 43B(h).'
  },
  {
    id: 'startup_scale',
    title: 'Startup Dynamics',
    subtitle: 'Unit Economics & Burn',
    icon: 'Zap',
    color: 'from-rose-500 to-pink-500',
    prompt: 'Help me analyze my business health. Walk me through calculating my unit economics, gross margins, and current runway. What strategic steps should I take to improve my cash efficiency ratio?'
  }
];

export const AI_MODELS: AIModelConfig[] = [
  // Google Gemini
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', description: 'Fast and efficient with Google Search' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', description: 'Most capable Gemini model' },
  // OpenAI (latest)
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai', description: 'Latest flagship model' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai', description: 'Balanced quality and speed' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai', description: 'Fastest lightweight GPT-5 model' },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', description: 'Reliable high-quality model' },
  { id: 'o4-mini', name: 'o4 Mini', provider: 'openai', description: 'Reasoning-focused OpenAI model' },
  // OpenRouter
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'OpenRouter Llama 3.1 8B (Free)', provider: 'openrouter', description: 'Free OpenRouter model for no-cost usage' },
  { id: 'google/gemma-2-9b-it:free', name: 'OpenRouter Gemma 2 9B (Free)', provider: 'openrouter', description: 'Free OpenRouter Gemma route' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'OpenRouter Mistral 7B (Free)', provider: 'openrouter', description: 'Free OpenRouter Mistral route' },
  // Anthropic Claude (latest)
  { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', provider: 'anthropic', description: 'Most capable Claude model' },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', description: 'Latest Sonnet generation' },
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'anthropic', description: 'Enhanced intelligence' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', description: 'Fast and efficient' },
  // Puter.js unified models (OpenAI + Anthropic)
  { id: 'openai/gpt-5', name: 'Puter GPT-5', provider: 'puter', description: 'Puter.js routed OpenAI GPT-5' },
  { id: 'openai/gpt-5-mini', name: 'Puter GPT-5 Mini', provider: 'puter', description: 'Puter.js routed OpenAI GPT-5 Mini' },
  { id: 'openai/gpt-4.1', name: 'Puter GPT-4.1', provider: 'puter', description: 'Puter.js routed OpenAI GPT-4.1' },
  { id: 'anthropic/claude-opus-4-1', name: 'Puter Claude Opus 4.1', provider: 'puter', description: 'Puter.js routed Anthropic Opus 4.1' },
  { id: 'anthropic/claude-sonnet-4', name: 'Puter Claude Sonnet 4', provider: 'puter', description: 'Puter.js routed Anthropic Sonnet 4' },
];

export const AUTO_MODEL_ID = 'auto';

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-5',
  anthropic: 'claude-opus-4-1-20250805',
  openrouter: 'meta-llama/llama-3.1-8b-instruct:free',
  puter: 'openai/gpt-5',
};
