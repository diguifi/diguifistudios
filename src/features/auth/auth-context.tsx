import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { apiClient, ApiError } from '../../shared/api/client';
import type { AuthState, AuthUser, GoogleAuthPayload } from './types';

interface AuthContextValue {
  authState: AuthState;
  user: AuthUser | null;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_TOKEN_STORAGE_KEYS = ['jwt', 'token', 'accessToken', 'authToken'] as const;

function hasStoredAuthToken() {
  if (typeof window === 'undefined') {
    return false;
  }

  return AUTH_TOKEN_STORAGE_KEYS.some((key) => {
    const value = window.localStorage.getItem(key);
    return typeof value === 'string' && value.trim().length > 0;
  });
}

function clearStoredAuthTokens() {
  if (typeof window === 'undefined') {
    return;
  }

  AUTH_TOKEN_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [authState, setAuthState] = useState<AuthState>(() =>
    hasStoredAuthToken() ? 'refreshing' : 'anonymous'
  );
  const [user, setUser] = useState<AuthUser | null>(null);

  const loadMe = useCallback(async () => {
    const profile = await apiClient.get<AuthUser>('/api/auth/me');
    setUser(profile);
    setAuthState('authenticated');
  }, []);

  const refreshSession = useCallback(async () => {
    setAuthState((current) => (current === 'authenticated' ? 'refreshing' : current));

    try {
      await apiClient.post('/api/auth/refresh', {});
      await loadMe();
    } catch (error) {
      clearStoredAuthTokens();
      setUser(null);
      setAuthState('anonymous');

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      throw error;
    }
  }, [loadMe]);

  useEffect(() => {
    if (!hasStoredAuthToken()) {
      setAuthState('anonymous');
      return;
    }

    void refreshSession();
  }, [refreshSession]);

  const loginWithGoogle = useCallback(
    async (payload: GoogleAuthPayload) => {
      setAuthState('authenticating');
      await apiClient.post('/api/auth/google', payload);
      await loadMe();
    },
    [loadMe]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout', {});
    } finally {
      clearStoredAuthTokens();
      setUser(null);
      setAuthState('anonymous');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      user,
      loginWithGoogle,
      refreshSession,
      logout
    }),
    [authState, loginWithGoogle, logout, refreshSession, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
