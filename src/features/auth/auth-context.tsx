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
import {
  clearStoredSessionTokens,
  extractSessionTokens,
  getStoredRefreshToken,
  hasStoredSessionTokens,
  storeSessionTokens
} from './token-storage';
import type { AuthState, AuthUser, GoogleAuthPayload, GoogleLoginResult } from './types';

interface AuthContextValue {
  authState: AuthState;
  user: AuthUser | null;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<GoogleLoginResult>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [authState, setAuthState] = useState<AuthState>(() =>
    hasStoredSessionTokens() ? 'refreshing' : 'anonymous'
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
      const response = await apiClient.post<Record<string, unknown>>('/api/auth/refresh', {
        refreshToken: getStoredRefreshToken()
      });
      storeSessionTokens(extractSessionTokens(response));
      await loadMe();
    } catch (error) {
      clearStoredSessionTokens();
      setUser(null);
      setAuthState('anonymous');

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      throw error;
    }
  }, [loadMe]);

  useEffect(() => {
    if (!hasStoredSessionTokens()) {
      setAuthState('anonymous');
      return;
    }

    void refreshSession();
  }, [refreshSession]);

  const loginWithGoogle = useCallback(
    async (payload: GoogleAuthPayload) => {
      setAuthState('authenticating');
      try {
        const response = await apiClient.post<Record<string, unknown>>('/api/auth/google', payload);
        storeSessionTokens(extractSessionTokens(response));
        await loadMe();
        return {
          needsFill: response.needsFill === true
        };
      } catch (error) {
        clearStoredSessionTokens();
        setUser(null);
        setAuthState('anonymous');
        throw error;
      }
    },
    [loadMe]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout', {
        refreshToken: getStoredRefreshToken()
      });
    } finally {
      clearStoredSessionTokens();
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
