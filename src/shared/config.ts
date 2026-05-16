const baseUrl = import.meta.env.BASE_URL;

export function buildInternalHashPath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const trimmedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return `${trimmedBaseUrl}${normalizedPath}`;
}

export function buildAbsoluteAppUrl(path: string) {
  return `${window.location.origin}${buildInternalHashPath(path)}`;
}
