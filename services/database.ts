
import { UserAccount, UserProfile, SubscriptionTier } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

// ─── Local-storage keys (fallback when Supabase is not configured) ───────────
const DB_KEY_USERS = 'pca_users';
const DB_KEY_SESSION = 'pca_current_user';
const ALLOWED_OPENROUTER_MODELS = new Set([
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-oss-120b:free',
  'google/gemma-3-27b-it:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
]);
const DEFAULT_OPENROUTER_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

/**
 * Hardened utility to recursively restore Date objects and ensure data integrity.
 * Prevents Prototype Pollution at the data layer.
 */
function deepHydrate(obj: any, seen = new WeakSet()): any {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      const d = new Date(obj);
      return isNaN(d.getTime()) ? obj : d;
    }
    return obj;
  }
  if (seen.has(obj)) return obj;
  seen.add(obj);
  if (Array.isArray(obj)) return obj.map(v => deepHydrate(v, seen));
  const result: any = {};
  for (const key of Object.keys(obj)) {
    // SECURITY: Explicitly exclude dangerous properties to prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    result[key] = deepHydrate(obj[key], seen);
  }
  return result;
}

/** Build a default blank UserProfile for new registrations. */
function createDefaultProfile(
  id: string,
  email: string,
  name: string,
  extra: Partial<UserProfile> = {}
): UserProfile {
  return {
    id,
    email,
    name,
    phoneNumber: '',
    designation: 'Executive',
    companyName: '',
    businessAddress: '',
    industryType: '',
    avatarUrl: '',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    assets: { cash: 0, equity: 0, realEstate: 0, emergencyFund: 0, gold: 0 },
    liabilities: { homeLoan: 0, personalLoan: 0, creditCard: 0 },
    riskAppetite: 'Moderate',
    goals: [],
    investmentPreferences: [],
    complianceTracks: ['Income Tax', 'GST'],
    documents: [],
    drafts: [],
    linkedAccounts: [],
    chatSessions: [],
    currentSessionId: null,
    memoryBank: '',
    subscription: { tier: 'free', messageCount: 0 },
    preferredAIProvider: 'openrouter',
    preferredModel: DEFAULT_OPENROUTER_MODEL,
    ...extra,
  };
}

function enforceAIProfileDefaults(profile: UserProfile): UserProfile {
  const nextModel = ALLOWED_OPENROUTER_MODELS.has(profile.preferredModel || '')
    ? profile.preferredModel!
    : DEFAULT_OPENROUTER_MODEL;
  return {
    ...profile,
    preferredAIProvider: 'openrouter',
    preferredModel: nextModel,
  };
}

// ─── Supabase-backed implementation ──────────────────────────────────────────

const supabaseAuth = {
  login: async (email: string, password: string): Promise<UserAccount> => {
    const sb = getSupabaseClient()!;
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });
    if (error || !data.user) throw new Error(error?.message ?? 'Authentication failed');

    const profile = enforceAIProfileDefaults(await supabaseUser.fetchProfile(data.user.id));
    const account = {
      id: data.user.id,
      email: data.user.email ?? email,
      passwordHash: '',
      name: profile.name,
      profile,
    };

    localStorage.setItem(DB_KEY_SESSION, JSON.stringify(account));
    return account;
  },

  register: async (email: string, password: string, name: string): Promise<UserAccount> => {
    const sb = getSupabaseClient()!;
    const cleanEmail = email.toLowerCase().trim();
    const { data, error } = await sb.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Registration failed');

    const profile = enforceAIProfileDefaults(await supabaseUser.ensureProfile(
      data.user.id,
      cleanEmail,
      name.trim(),
    ));

    const account = {
      id: data.user.id,
      email: cleanEmail,
      passwordHash: '',
      name: name.trim(),
      profile,
    };

    localStorage.setItem(DB_KEY_SESSION, JSON.stringify(account));
    return account;
  },

  logout: async () => {
    const sb = getSupabaseClient()!;
    await sb.auth.signOut();
    localStorage.removeItem(DB_KEY_SESSION);
  },

  getSession: (): UserAccount | null => {
    // Synchronous call – we also cache in localStorage for instant hydration.
    // The real session refresh happens asynchronously via Supabase's auto-refresh.
    try {
      const saved = localStorage.getItem(DB_KEY_SESSION);
      if (!saved) return null;
      return deepHydrate(JSON.parse(saved));
    } catch {
      localStorage.removeItem(DB_KEY_SESSION);
      return null;
    }
  },
};

const supabaseUser = {
  /** Fetch a profile row from the `profiles` table. */
  fetchProfile: async (userId: string): Promise<UserProfile> => {
    const sb = getSupabaseClient()!;
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) throw new Error('Profile not found');
    return enforceAIProfileDefaults(deepHydrate(data) as UserProfile);
  },

  /** Upsert a profile – used after first sign-in / registration. */
  ensureProfile: async (
    userId: string,
    email: string,
    name: string,
    avatarUrl = '',
  ): Promise<UserProfile> => {
    const sb = getSupabaseClient()!;

    // Try to read first
    const { data: existing } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existing) return enforceAIProfileDefaults(deepHydrate(existing) as UserProfile);

    const newProfile = createDefaultProfile(userId, email, name, {
      avatarUrl,
      memoryBank: '',
      designation: 'Executive',
    });

    const { data, error } = await sb
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to create profile');
    return enforceAIProfileDefaults(deepHydrate(data) as UserProfile);
  },

  updateProfile: async (accountId: string, updates: Partial<UserProfile>): Promise<UserAccount> => {
    const sb = getSupabaseClient()!;
    const { data, error } = await sb
      .from('profiles')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Profile update failed');

    const profile = enforceAIProfileDefaults(deepHydrate(data) as UserProfile);
    const account: UserAccount = {
      id: accountId,
      email: profile.email,
      passwordHash: '',
      name: updates.name ?? profile.name,
      profile,
    };

    // Keep local cache in sync
    localStorage.setItem(DB_KEY_SESSION, JSON.stringify(account));
    return account;
  },

  upgradeSubscription: async (accountId: string, tier: SubscriptionTier): Promise<UserAccount> => {
    return supabaseUser.updateProfile(accountId, {
      subscription: {
        tier,
        messageCount: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  },
};

// ─── localStorage-backed fallback (original implementation) ──────────────────

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function hashPassword(password: string): Promise<string> {
  // NOTE: This localStorage fallback uses a simple deterministic salt.
  // In production, Supabase Auth handles password hashing with bcrypt.
  // This is only used when SUPABASE_URL/SUPABASE_ANON_KEY are not configured.
  const salt = 'pca_local_demo_salt_v2';
  const salted = password + salt;
  const msgBuffer = new TextEncoder().encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const localAuth = {
  login: async (email: string, password: string): Promise<UserAccount> => {
    await delay(600);
    const usersRaw = localStorage.getItem(DB_KEY_USERS);
    const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];
    const hashedPassword = await hashPassword(password);

    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim() && u.passwordHash === hashedPassword
    );
    if (!user) throw new Error('Invalid Credentials / Identity Node Mismatch');

    const hydratedUser = deepHydrate(user);
    hydratedUser.profile = enforceAIProfileDefaults(hydratedUser.profile);
    localStorage.setItem(DB_KEY_SESSION, JSON.stringify(hydratedUser));
    return hydratedUser;
  },

  register: async (email: string, password: string, name: string): Promise<UserAccount> => {
    await delay(800);
    const usersRaw = localStorage.getItem(DB_KEY_USERS);
    const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];

    const cleanEmail = email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Identity already exists in this node');
    }

    const hashedPassword = await hashPassword(password);
    const newProfile = createDefaultProfile(crypto.randomUUID(), cleanEmail, name.trim());

    const newAccount: UserAccount = {
      id: newProfile.id,
      email: cleanEmail,
      passwordHash: hashedPassword,
      name: name.trim(),
      profile: newProfile,
    };

    users.push(newAccount);
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
    localStorage.setItem(DB_KEY_SESSION, JSON.stringify(newAccount));
    const hydratedAccount = deepHydrate(newAccount);
    hydratedAccount.profile = enforceAIProfileDefaults(hydratedAccount.profile);
    localStorage.setItem(DB_KEY_SESSION, JSON.stringify(hydratedAccount));
    return hydratedAccount;
  },

  logout: async () => {
    localStorage.removeItem(DB_KEY_SESSION);
    await delay(100);
  },

  getSession: (): UserAccount | null => {
    try {
      const saved = localStorage.getItem(DB_KEY_SESSION);
      if (!saved) return null;
      const session = deepHydrate(JSON.parse(saved));
      session.profile = enforceAIProfileDefaults(session.profile);
      return session;
    } catch (e) {
      console.error('Session Retrieval Fault:', e);
      localStorage.removeItem(DB_KEY_SESSION);
      return null;
    }
  },
};

const localUser = {
  updateProfile: async (accountId: string, updates: Partial<UserProfile>): Promise<UserAccount> => {
    try {
      const usersRaw = localStorage.getItem(DB_KEY_USERS);
      const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];
      const idx = users.findIndex(u => u.id === accountId);
      if (idx === -1) throw new Error('Data Sync Fault');

      const existingProfile = users[idx].profile;
      const updatedProfile = enforceAIProfileDefaults({ ...existingProfile, ...updates } as UserProfile);
      const updatedUser = {
        ...users[idx],
        profile: updatedProfile,
        name: updates.name || users[idx].name,
      };

      users[idx] = updatedUser;
      localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));

      const activeSession = localAuth.getSession();
      if (activeSession && activeSession.id === accountId) {
        localStorage.setItem(DB_KEY_SESSION, JSON.stringify(updatedUser));
      }

      return deepHydrate(updatedUser);
    } catch (err) {
      console.error('Profile update failed', err);
      throw err;
    }
  },

  upgradeSubscription: async (accountId: string, tier: SubscriptionTier): Promise<UserAccount> => {
    return localUser.updateProfile(accountId, {
      subscription: {
        tier,
        messageCount: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  },
};

// ─── Exported APIs: localStorage-based temporary auth ────────────────────────
// All data is saved locally in the browser's localStorage.
// Supabase implementations are retained above for future production use.

export const authAPI = {
  login: (email: string, password: string) =>
    isSupabaseConfigured() ? supabaseAuth.login(email, password) : localAuth.login(email, password),
  register: (email: string, password: string, name: string) =>
    isSupabaseConfigured() ? supabaseAuth.register(email, password, name) : localAuth.register(email, password, name),
  logout: () => (isSupabaseConfigured() ? supabaseAuth.logout() : localAuth.logout()),
  getSession: (): UserAccount | null =>
    isSupabaseConfigured() ? supabaseAuth.getSession() : localAuth.getSession(),
};

export const userAPI = {
  updateProfile: (accountId: string, updates: Partial<UserProfile>) =>
    isSupabaseConfigured()
      ? supabaseUser.updateProfile(accountId, updates)
      : localUser.updateProfile(accountId, updates),
  upgradeSubscription: (accountId: string, tier: SubscriptionTier) =>
    isSupabaseConfigured()
      ? supabaseUser.upgradeSubscription(accountId, tier)
      : localUser.upgradeSubscription(accountId, tier),
};
