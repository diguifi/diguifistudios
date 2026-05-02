const baseUrl = import.meta.env.BASE_URL;
const isMockApiEnabled = import.meta.env.VITE_ENABLE_API_MOCKS === 'true';
const oauthCallbackPath = import.meta.env.VITE_OAUTH_CALLBACK_PATH ?? '/auth/callback';
const oauthEntryUrl = import.meta.env.VITE_GOOGLE_AUTH_ENTRY_URL;

export function buildInternalHashPath(path: string) {
  return `${baseUrl}#${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildLoginHref(nextPath: string) {
  if (oauthEntryUrl) {
    const url = new URL(oauthEntryUrl, window.location.origin);
    url.searchParams.set('next', nextPath);
    return url.toString();
  }

  if (isMockApiEnabled) {
    return `${buildInternalHashPath(oauthCallbackPath)}?code=demo-google-oauth-code&next=${encodeURIComponent(nextPath)}`;
  }

  return buildInternalHashPath(oauthCallbackPath);
}

export function buildAbsoluteAppUrl(path: string) {
  return `${window.location.origin}${buildInternalHashPath(path)}`;
}
