const ACCESS_TOKEN_STORAGE_KEY = 'auth.accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'auth.refreshToken';
const LEGACY_ACCESS_TOKEN_STORAGE_KEYS = ['jwt', 'token', 'accessToken', 'authToken'] as const;
const LEGACY_REFRESH_TOKEN_STORAGE_KEYS = ['refreshToken', 'refreshJwt'] as const;

function getFirstStoredValue(keys: readonly string[]) {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function setStoredValue(key: string, value: string | null | undefined) {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    window.localStorage.setItem(key, value);
    return;
  }

  window.localStorage.removeItem(key);
}

export function getStoredAccessToken() {
  return getFirstStoredValue([ACCESS_TOKEN_STORAGE_KEY, ...LEGACY_ACCESS_TOKEN_STORAGE_KEYS]);
}

export function getStoredRefreshToken() {
  return getFirstStoredValue([REFRESH_TOKEN_STORAGE_KEY, ...LEGACY_REFRESH_TOKEN_STORAGE_KEYS]);
}

export function hasStoredSessionTokens() {
  return Boolean(getStoredAccessToken() || getStoredRefreshToken());
}

export function storeSessionTokens(tokens: {
  accessToken?: string | null;
  refreshToken?: string | null;
}) {
  setStoredValue(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
  setStoredValue(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
}

export function clearStoredSessionTokens() {
  if (typeof window === 'undefined') {
    return;
  }

  [
    ACCESS_TOKEN_STORAGE_KEY,
    REFRESH_TOKEN_STORAGE_KEY,
    ...LEGACY_ACCESS_TOKEN_STORAGE_KEYS,
    ...LEGACY_REFRESH_TOKEN_STORAGE_KEYS
  ].forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

export function extractSessionTokens(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return { accessToken: null, refreshToken: null };
  }

  const data = payload as Record<string, unknown>;
  const accessTokenCandidates = ['accessToken', 'token', 'jwt', 'authToken'];
  const refreshTokenCandidates = ['refreshToken', 'refreshJwt'];

  const accessToken =
    accessTokenCandidates.find(
      (key) => typeof data[key] === 'string' && (data[key] as string).trim().length > 0
    ) ?? null;
  const refreshToken =
    refreshTokenCandidates.find(
      (key) => typeof data[key] === 'string' && (data[key] as string).trim().length > 0
    ) ?? null;

  return {
    accessToken: accessToken ? (data[accessToken] as string) : null,
    refreshToken: refreshToken ? (data[refreshToken] as string) : null
  };
}
