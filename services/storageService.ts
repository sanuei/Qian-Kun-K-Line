import { ActivationCode, UsageState } from '../types';

const STORAGE_KEY_USAGE = 'qiankun_usage';
const STORAGE_KEY_CODES = 'qiankun_admin_codes';
const STORAGE_KEY_RATING = 'qiankun_user_rating';

// Initial state
const initialUsage: UsageState = {
  count: 0,
  isActivated: false,
  extraTrials: 0
};

// --- User Side ---

export const getUsageState = (): UsageState => {
  const stored = localStorage.getItem(STORAGE_KEY_USAGE);
  if (!stored) return initialUsage;
  const parsed = JSON.parse(stored);
  // Backwards compatibility
  return { ...initialUsage, ...parsed };
};

export const incrementUsage = (): UsageState => {
  const state = getUsageState();
  if (state.isActivated) return state; // No increment if activated
  
  const newState = { ...state, count: state.count + 1 };
  localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(newState));
  return newState;
};

export const addExtraTrial = (): UsageState => {
  const state = getUsageState();
  const newState = { ...state, extraTrials: (state.extraTrials || 0) + 1 };
  localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(newState));
  return newState;
};

export const activateApp = (code: string): boolean => {
  const allCodes = getStoredCodes();
  const targetCode = allCodes.find(c => c.code === code && !c.isUsed);
  
  if (targetCode) {
    // 1. Mark code as used in "backend"
    targetCode.isUsed = true;
    localStorage.setItem(STORAGE_KEY_CODES, JSON.stringify(allCodes));

    // 2. Activate user
    const state = getUsageState();
    const newState = { ...state, isActivated: true };
    localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(newState));
    return true;
  }
  return false;
};

export const getStoredRating = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY_RATING);
  return stored ? parseInt(stored, 10) : 0;
};

export const saveRating = (rating: number) => {
  localStorage.setItem(STORAGE_KEY_RATING, rating.toString());
};

// --- Admin Side ---

export const getStoredCodes = (): ActivationCode[] => {
  const stored = localStorage.getItem(STORAGE_KEY_CODES);
  if (!stored) return [];
  return JSON.parse(stored);
};

export const generateCodes = (amount: number): ActivationCode[] => {
  const current = getStoredCodes();
  const newCodes: ActivationCode[] = [];
  
  for (let i = 0; i < amount; i++) {
    const code = 'TK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    newCodes.push({
      code,
      isUsed: false,
      generatedAt: Date.now()
    });
  }
  
  const updated = [...newCodes, ...current];
  localStorage.setItem(STORAGE_KEY_CODES, JSON.stringify(updated));
  return newCodes;
};

export const resetUsageForTesting = () => {
  localStorage.removeItem(STORAGE_KEY_USAGE);
  localStorage.removeItem(STORAGE_KEY_RATING);
};
