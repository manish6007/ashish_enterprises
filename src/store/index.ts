import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { usersService } from '../services/firestore';
import { AppUser } from '../types';

interface AuthState {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  confirmationResult: ConfirmationResult | null;
  recaptchaVerifier: RecaptchaVerifier | null;

  // Actions
  initAuth: () => () => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AppUser>) => Promise<void>;
  setAppUser: (user: AppUser | null) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  appUser: null,
  loading: true,
  confirmationResult: null,
  recaptchaVerifier: null,

  initAuth: () => {
    // Set a timeout to prevent hanging forever (e.g., if Firebase is blocked or getDoc hangs)
    const timeoutId = setTimeout(() => {
      if (get().loading) {
        console.warn('Auth initialization timed out after 5s. Forcing loading to false.');
        set({ loading: false });
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const appUser = await usersService.getById(user.uid);
          set({ user, appUser, loading: false });
        } else {
          set({ user: null, appUser: null, loading: false });
        }
      } catch (error) {
        console.error('Failed to fetch user in initAuth:', error);
        set({ user: null, appUser: null, loading: false });
      } finally {
        clearTimeout(timeoutId);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  },

  sendOTP: async (phone: string) => {
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    // Clear old verifier
    const old = get().recaptchaVerifier;
    if (old) old.clear();

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });

    const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    set({ confirmationResult: confirmation, recaptchaVerifier: verifier });
  },

  verifyOTP: async (otp: string) => {
    const { confirmationResult } = get();
    if (!confirmationResult) throw new Error('No OTP sent');

    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    // Upsert user in Firestore
    await usersService.upsert(user.uid, {
      phone: user.phoneNumber || '',
      name: user.displayName || 'Customer',
      role: 'customer',
    });

    const appUser = await usersService.getById(user.uid);
    set({ user, appUser, confirmationResult: null });
  },

  loginWithEmail: async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const appUser = await usersService.getById(result.user.uid);
    if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'staff')) {
      await signOut(auth);
      throw new Error('Unauthorized: Admin or Staff access only');
    }
    set({ user: result.user, appUser });
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, appUser: null });
  },

  updateProfile: async (data: Partial<AppUser>) => {
    const { user, appUser } = get();
    if (!user) return;
    await usersService.upsert(user.uid, data);
    set({ appUser: { ...appUser!, ...data } });
  },

  setAppUser: (appUser) => set({ appUser }),
}));

// ─── Theme Store ───────────────────────────────────────────────────────────────

interface ThemeState {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      toggleMode: () => set({ mode: get().mode === 'light' ? 'dark' : 'light' }),
    }),
    { name: 'jio-vip-theme' }
  )
);

// ─── Wishlist Store (local cache) ──────────────────────────────────────────────

interface WishlistState {
  ids: string[];
  setWishlist: (ids: string[]) => void;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      setWishlist: (ids) => set({ ids }),
      addToWishlist: (id) => set({ ids: [...get().ids, id] }),
      removeFromWishlist: (id) => set({ ids: get().ids.filter((i) => i !== id) }),
      isInWishlist: (id) => get().ids.includes(id),
    }),
    { name: 'jio-vip-wishlist' }
  )
);
