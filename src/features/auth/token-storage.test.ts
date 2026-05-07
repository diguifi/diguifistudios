import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearStoredSessionTokens,
  extractSessionTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  hasStoredSessionTokens,
  storeSessionTokens
} from './token-storage';

beforeEach(() => {
  localStorage.clear();
});

describe('getStoredAccessToken', () => {
  it('returns null when nothing is stored', () => {
    expect(getStoredAccessToken()).toBeNull();
  });

  it('reads from auth.accessToken first', () => {
    localStorage.setItem('auth.accessToken', 'primary-access');
    localStorage.setItem('jwt', 'legacy-jwt');
    expect(getStoredAccessToken()).toBe('primary-access');
  });

  it('falls back to legacy jwt key', () => {
    localStorage.setItem('jwt', 'legacy-jwt');
    expect(getStoredAccessToken()).toBe('legacy-jwt');
  });

  it('falls back to legacy token key', () => {
    localStorage.setItem('token', 'legacy-token');
    expect(getStoredAccessToken()).toBe('legacy-token');
  });

  it('falls back to legacy accessToken key', () => {
    localStorage.setItem('accessToken', 'legacy-access');
    expect(getStoredAccessToken()).toBe('legacy-access');
  });

  it('falls back to legacy authToken key', () => {
    localStorage.setItem('authToken', 'legacy-auth');
    expect(getStoredAccessToken()).toBe('legacy-auth');
  });

  it('skips whitespace-only values', () => {
    localStorage.setItem('auth.accessToken', '   ');
    localStorage.setItem('jwt', 'real-jwt');
    expect(getStoredAccessToken()).toBe('real-jwt');
  });

  it('returns null for whitespace-only value with no fallback', () => {
    localStorage.setItem('auth.accessToken', '   ');
    expect(getStoredAccessToken()).toBeNull();
  });
});

describe('getStoredRefreshToken', () => {
  it('returns null when nothing is stored', () => {
    expect(getStoredRefreshToken()).toBeNull();
  });

  it('reads from auth.refreshToken first', () => {
    localStorage.setItem('auth.refreshToken', 'primary-refresh');
    localStorage.setItem('refreshToken', 'legacy-refresh');
    expect(getStoredRefreshToken()).toBe('primary-refresh');
  });

  it('falls back to legacy refreshToken key', () => {
    localStorage.setItem('refreshToken', 'legacy-refresh');
    expect(getStoredRefreshToken()).toBe('legacy-refresh');
  });

  it('falls back to legacy refreshJwt key', () => {
    localStorage.setItem('refreshJwt', 'legacy-refresh-jwt');
    expect(getStoredRefreshToken()).toBe('legacy-refresh-jwt');
  });

  it('skips whitespace-only values', () => {
    localStorage.setItem('auth.refreshToken', '   ');
    localStorage.setItem('refreshToken', 'fallback');
    expect(getStoredRefreshToken()).toBe('fallback');
  });
});

describe('hasStoredSessionTokens', () => {
  it('returns false when no tokens stored', () => {
    expect(hasStoredSessionTokens()).toBe(false);
  });

  it('returns true when access token is stored', () => {
    localStorage.setItem('auth.accessToken', 'access');
    expect(hasStoredSessionTokens()).toBe(true);
  });

  it('returns true when refresh token is stored', () => {
    localStorage.setItem('auth.refreshToken', 'refresh');
    expect(hasStoredSessionTokens()).toBe(true);
  });

  it('returns true when only a legacy key is stored', () => {
    localStorage.setItem('jwt', 'legacy');
    expect(hasStoredSessionTokens()).toBe(true);
  });
});

describe('storeSessionTokens', () => {
  it('stores both tokens', () => {
    storeSessionTokens({ accessToken: 'access', refreshToken: 'refresh' });
    expect(localStorage.getItem('auth.accessToken')).toBe('access');
    expect(localStorage.getItem('auth.refreshToken')).toBe('refresh');
  });

  it('removes existing tokens when null is passed', () => {
    localStorage.setItem('auth.accessToken', 'old');
    localStorage.setItem('auth.refreshToken', 'old');
    storeSessionTokens({ accessToken: null, refreshToken: null });
    expect(localStorage.getItem('auth.accessToken')).toBeNull();
    expect(localStorage.getItem('auth.refreshToken')).toBeNull();
  });

  it('removes token when empty string is passed', () => {
    localStorage.setItem('auth.accessToken', 'old');
    storeSessionTokens({ accessToken: '' });
    expect(localStorage.getItem('auth.accessToken')).toBeNull();
  });

  it('stores only provided tokens', () => {
    storeSessionTokens({ accessToken: 'access-only' });
    expect(localStorage.getItem('auth.accessToken')).toBe('access-only');
    expect(localStorage.getItem('auth.refreshToken')).toBeNull();
  });
});

describe('clearStoredSessionTokens', () => {
  it('clears all primary and legacy keys', () => {
    localStorage.setItem('auth.accessToken', 'a');
    localStorage.setItem('auth.refreshToken', 'r');
    localStorage.setItem('jwt', 'j');
    localStorage.setItem('token', 't');
    localStorage.setItem('accessToken', 'at');
    localStorage.setItem('authToken', 'auth');
    localStorage.setItem('refreshToken', 'rt');
    localStorage.setItem('refreshJwt', 'rj');
    clearStoredSessionTokens();
    expect(localStorage.getItem('auth.accessToken')).toBeNull();
    expect(localStorage.getItem('auth.refreshToken')).toBeNull();
    expect(localStorage.getItem('jwt')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('refreshJwt')).toBeNull();
  });

  it('does not throw when storage is already empty', () => {
    expect(() => clearStoredSessionTokens()).not.toThrow();
  });
});

describe('extractSessionTokens', () => {
  it('returns null tokens for null input', () => {
    expect(extractSessionTokens(null)).toEqual({ accessToken: null, refreshToken: null });
  });

  it('returns null tokens for string input', () => {
    expect(extractSessionTokens('string')).toEqual({ accessToken: null, refreshToken: null });
  });

  it('returns null tokens for number input', () => {
    expect(extractSessionTokens(42)).toEqual({ accessToken: null, refreshToken: null });
  });

  it('extracts by accessToken key', () => {
    const result = extractSessionTokens({ accessToken: 'my-access', refreshToken: 'my-refresh' });
    expect(result.accessToken).toBe('my-access');
    expect(result.refreshToken).toBe('my-refresh');
  });

  it('extracts by jwt key', () => {
    const result = extractSessionTokens({ jwt: 'my-jwt' });
    expect(result.accessToken).toBe('my-jwt');
  });

  it('extracts by token key', () => {
    const result = extractSessionTokens({ token: 'my-token' });
    expect(result.accessToken).toBe('my-token');
  });

  it('extracts by authToken key', () => {
    const result = extractSessionTokens({ authToken: 'my-auth' });
    expect(result.accessToken).toBe('my-auth');
  });

  it('extracts refresh by refreshJwt key', () => {
    const result = extractSessionTokens({ refreshJwt: 'my-rjwt' });
    expect(result.refreshToken).toBe('my-rjwt');
  });

  it('returns null for whitespace-only token values', () => {
    const result = extractSessionTokens({ accessToken: '   ' });
    expect(result.accessToken).toBeNull();
  });

  it('returns null when no recognized keys are present', () => {
    const result = extractSessionTokens({ unknownKey: 'value' });
    expect(result.accessToken).toBeNull();
    expect(result.refreshToken).toBeNull();
  });
});
