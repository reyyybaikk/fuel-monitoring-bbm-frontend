import { create } from 'zustand';

/**
 * User profile information stored after login.
 */
export interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'ADMIN_PUSAT' | 'ADMIN' | 'MANAGER' | 'DRIVER';
  region?: string;
}

/**
 * Zustand state for authentication.
 */
interface AuthState {
  /** Set the user profile manually (e.g., after page refresh). */
  setUserProfile: (user: UserProfile) => void;
  /** Currently authenticated user profile, or null when not logged in. */
  userProfile: UserProfile | null;
  /** JWT/access token stored in `localStorage`. */
  accessToken: string | null;
  /** Convenience flag – true when a token exists. */
  isAuthenticated: boolean;
  /** Login routine – stores token and profile. */
  login: (user: UserProfile, token: string) => void;
  /** Logout routine – clears storage and state. */
  logout: () => void;
}

/* ------------------------------------------------------------------ */
/*   Zustand store --------------------------------------------------- */
/* ------------------------------------------------------------------ */
export const useAuthStore = create<AuthState>((set) => ({
  userProfile: null,
  accessToken:
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  isAuthenticated:
    typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false,

  /** Store a profile that may have been fetched after a page refresh */
  setUserProfile: (user) => set({ userProfile: user }),

  /** Persist token & profile after a successful login */
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
    set({ userProfile: user, accessToken: token, isAuthenticated: true });
  },

  /** Remove token & reset state on logout */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    set({ userProfile: null, accessToken: null, isAuthenticated: false });
  },
}));