
import { UserAccount, UserProfile, SubscriptionTier } from '../types';

const DB_KEY_USERS = 'pca_users';
const DB_KEY_SESSION = 'pca_current_user';
// Static salt for local demo security. In production, use per-user salt on backend.
const SALT = "pca_v2_core_salt_738491";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function hashPassword(password: string): Promise<string> {
  const salted = password + SALT;
  const msgBuffer = new TextEncoder().encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hardened utility to recursively restore Date objects and ensure data integrity.
 * Prevents Prototype Pollution at the data layer.
 */
function deepHydrate(obj: any, seen = new WeakSet()): any {
  if (obj === null || typeof obj !== 'object') {
    // String to Date detection for ISO strings
    if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      const d = new Date(obj);
      return isNaN(d.getTime()) ? obj : d;
    }
    return obj;
  }

  // Handle circular references if any (though unlikely in stored JSON)
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

export const authAPI = {
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
      id: 'google-oauth2-12345',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'
    };

    let user = users.find(u => u.email.toLowerCase() === googleIdentity.email.toLowerCase());
    
    if (!user) {
      const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        email: googleIdentity.email,
        name: googleIdentity.name,
        phoneNumber: '',
        designation: 'Strategic Investor',
        companyName: '',
        businessAddress: '',
        industryType: '',
        avatarUrl: googleIdentity.picture,
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
        memoryBank: "Google Linked Account Initialized.",
        subscription: { tier: 'free', messageCount: 0 }
      };

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
    const newProfile: UserProfile = {
      id: crypto.randomUUID(),
      email: cleanEmail,
      name: name.trim(),
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
      memoryBank: "",
      subscription: { tier: 'free', messageCount: 0 }
    };

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
      console.error("Session Retrieval Fault:", e);
      localStorage.removeItem(DB_KEY_SESSION);
      return null;
    }
  }
};

export const userAPI = {
  updateProfile: async (accountId: string, updates: Partial<UserProfile>): Promise<UserAccount> => {
    try {
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
      
      const activeSession = authAPI.getSession();
      if (activeSession && activeSession.id === accountId) {
        localStorage.setItem(DB_KEY_SESSION, JSON.stringify(updatedUser));
      }

      return deepHydrate(updatedUser);
    } catch (err) {
      console.error("Profile update failed", err);
      throw err;
    }
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
