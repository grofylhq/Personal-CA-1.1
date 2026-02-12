import { UserAccount, UserProfile, SubscriptionTier } from '../types';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const DB_KEY_USERS = 'pca_users';
const DB_KEY_SESSION = 'pca_current_user';
const SALT = 'pca_v2_core_salt_738491';

type UserAccountRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  profile_json: UserProfile;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function hashPassword(password: string): Promise<string> {
  const salted = password + SALT;
  const msgBuffer = new TextEncoder().encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function deepHydrate(obj: any, seen = new WeakSet()): any {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      const d = new Date(obj);
      return Number.isNaN(d.getTime()) ? obj : d;
    }
    return obj;
  }

  if (seen.has(obj)) return obj;
  seen.add(obj);

  if (Array.isArray(obj)) return obj.map(v => deepHydrate(v, seen));

  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    result[key] = deepHydrate(obj[key], seen);
  }
  return result;
}

const createDefaultProfile = (id: string, email: string, name: string, avatarUrl = '', designation = 'Executive', memoryBank = ''): UserProfile => ({
  id,
  email,
  name,
  phoneNumber: '',
  designation,
  companyName: '',
  businessAddress: '',
  industryType: '',
  avatarUrl,
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
  memoryBank,
  subscription: { tier: 'free', messageCount: 0 }
});

const mapRowToAccount = (row: UserAccountRow): UserAccount => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  name: row.name,
  profile: row.profile_json
});

async function getSupabaseUserByEmail(email: string): Promise<UserAccountRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_accounts')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data as UserAccountRow | null;
}

async function getSupabaseUserById(id: string): Promise<UserAccountRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_accounts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as UserAccountRow | null;
}

async function upsertSession(account: UserAccount) {
  localStorage.setItem(DB_KEY_SESSION, JSON.stringify(account));
}

const localAuthAPI = {
  login: async (email: string, password: string): Promise<UserAccount> => {
    await delay(600);
    const usersRaw = localStorage.getItem(DB_KEY_USERS);
    const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];
    const hashedPassword = await hashPassword(password);

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.passwordHash === hashedPassword);
    if (!user) throw new Error('Invalid Credentials / Identity Node Mismatch');

    const hydratedUser = deepHydrate(user);
    localStorage.setItem(DB_KEY_SESSION, JSON.stringify(hydratedUser));
    return hydratedUser;
  },

  loginWithGoogle: async (): Promise<UserAccount> => {
    await delay(1500);
    const usersRaw = localStorage.getItem(DB_KEY_USERS);
    const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];

    const googleIdentity = {
      email: 'investor.demo@gmail.com',
      name: 'Google User',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'
    };

    let user = users.find(u => u.email.toLowerCase() === googleIdentity.email.toLowerCase());

    if (!user) {
      const newProfile = createDefaultProfile(
        crypto.randomUUID(),
        googleIdentity.email,
        googleIdentity.name,
        googleIdentity.picture,
        'Strategic Investor',
        'Google Linked Account Initialized.'
      );

      user = {
        id: newProfile.id,
        email: googleIdentity.email,
        passwordHash: 'social_linked',
        name: googleIdentity.name,
        profile: newProfile
      };

      users.push(user);
      localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
    }

    const hydratedUser = deepHydrate(user);
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
      profile: newProfile
    };

    users.push(newAccount);
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
    localStorage.setItem(DB_KEY_SESSION, JSON.stringify(newAccount));
    return deepHydrate(newAccount);
  },

  logout: async () => {
    localStorage.removeItem(DB_KEY_SESSION);
    await delay(100);
  },

  getSession: (): UserAccount | null => {
    try {
      const saved = localStorage.getItem(DB_KEY_SESSION);
      if (!saved) return null;
      return deepHydrate(JSON.parse(saved));
    } catch (e) {
      console.error('Session Retrieval Fault:', e);
      localStorage.removeItem(DB_KEY_SESSION);
      return null;
    }
  }
};

const localUserAPI = {
  updateProfile: async (accountId: string, updates: Partial<UserProfile>): Promise<UserAccount> => {
    const usersRaw = localStorage.getItem(DB_KEY_USERS);
    const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex(u => u.id === accountId);
    if (idx === -1) throw new Error('Data Sync Fault');

    const existingProfile = users[idx].profile;
    const updatedProfile = { ...existingProfile, ...updates };

    const updatedUser = {
      ...users[idx],
      profile: updatedProfile,
      name: updates.name || users[idx].name
    };

    users[idx] = updatedUser;
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));

    const activeSession = localAuthAPI.getSession();
    if (activeSession && activeSession.id === accountId) {
      localStorage.setItem(DB_KEY_SESSION, JSON.stringify(updatedUser));
    }

    return deepHydrate(updatedUser);
  },

  upgradeSubscription: async (accountId: string, tier: SubscriptionTier): Promise<UserAccount> => {
    return localUserAPI.updateProfile(accountId, {
      subscription: {
        tier,
        messageCount: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  }
};

export const authAPI = {
  login: async (email: string, password: string): Promise<UserAccount> => {
    if (!hasSupabaseConfig || !supabase) return localAuthAPI.login(email, password);

    const cleanEmail = email.toLowerCase().trim();
    const row = await getSupabaseUserByEmail(cleanEmail);
    const hashedPassword = await hashPassword(password);

    if (!row || row.password_hash !== hashedPassword) {
      throw new Error('Invalid Credentials / Identity Node Mismatch');
    }

    const account = deepHydrate(mapRowToAccount(row));
    await upsertSession(account);
    return account;
  },

  loginWithGoogle: async (): Promise<UserAccount> => {
    if (!hasSupabaseConfig || !supabase) return localAuthAPI.loginWithGoogle();

    const googleIdentity = {
      email: 'investor.demo@gmail.com',
      name: 'Google User',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'
    };

    const cleanEmail = googleIdentity.email.toLowerCase();
    let row = await getSupabaseUserByEmail(cleanEmail);

    if (!row) {
      const id = crypto.randomUUID();
      const profile = createDefaultProfile(
        id,
        cleanEmail,
        googleIdentity.name,
        googleIdentity.picture,
        'Strategic Investor',
        'Google Linked Account Initialized.'
      );

      const { data, error } = await supabase
        .from('user_accounts')
        .insert({
          id,
          email: cleanEmail,
          password_hash: 'social_linked',
          name: googleIdentity.name,
          profile_json: profile
        })
        .select('*')
        .single();

      if (error) throw error;
      row = data as UserAccountRow;
    }

    const account = deepHydrate(mapRowToAccount(row));
    await upsertSession(account);
    return account;
  },

  register: async (email: string, password: string, name: string): Promise<UserAccount> => {
    if (!hasSupabaseConfig || !supabase) return localAuthAPI.register(email, password, name);

    const cleanEmail = email.toLowerCase().trim();
    const existing = await getSupabaseUserByEmail(cleanEmail);
    if (existing) throw new Error('Identity already exists in this node');

    const id = crypto.randomUUID();
    const profile = createDefaultProfile(id, cleanEmail, name.trim());
    const passwordHash = await hashPassword(password);

    const { data, error } = await supabase
      .from('user_accounts')
      .insert({
        id,
        email: cleanEmail,
        password_hash: passwordHash,
        name: name.trim(),
        profile_json: profile
      })
      .select('*')
      .single();

    if (error) throw error;

    const account = deepHydrate(mapRowToAccount(data as UserAccountRow));
    await upsertSession(account);
    return account;
  },

  logout: async () => {
    localStorage.removeItem(DB_KEY_SESSION);
    await delay(100);
  },

  getSession: (): UserAccount | null => {
    try {
      const saved = localStorage.getItem(DB_KEY_SESSION);
      if (!saved) return null;
      return deepHydrate(JSON.parse(saved));
    } catch (e) {
      console.error('Session Retrieval Fault:', e);
      localStorage.removeItem(DB_KEY_SESSION);
      return null;
    }
  },

  syncSession: async (): Promise<UserAccount | null> => {
    if (!hasSupabaseConfig || !supabase) return authAPI.getSession();
    const current = authAPI.getSession();
    if (!current) return null;

    try {
      const row = await getSupabaseUserById(current.id);
      if (!row) {
        localStorage.removeItem(DB_KEY_SESSION);
        return null;
      }
      const account = deepHydrate(mapRowToAccount(row));
      await upsertSession(account);
      return account;
    } catch {
      return current;
    }
  }
};

export const userAPI = {
  updateProfile: async (accountId: string, updates: Partial<UserProfile>): Promise<UserAccount> => {
    if (!hasSupabaseConfig || !supabase) return localUserAPI.updateProfile(accountId, updates);

    const row = await getSupabaseUserById(accountId);
    if (!row) throw new Error('Data Sync Fault');

    const updatedProfile: UserProfile = { ...row.profile_json, ...updates };
    const updatedName = updates.name || row.name;

    const { data, error } = await supabase
      .from('user_accounts')
      .update({
        name: updatedName,
        profile_json: updatedProfile,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)
      .select('*')
      .single();

    if (error) throw error;

    const account = deepHydrate(mapRowToAccount(data as UserAccountRow));
    await upsertSession(account);
    return account;
  },

  upgradeSubscription: async (accountId: string, tier: SubscriptionTier): Promise<UserAccount> => {
    return userAPI.updateProfile(accountId, {
      subscription: {
        tier,
        messageCount: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  }
};
