const baseUrl = import.meta.env.BASE_URL;

export function buildInternalHashPath(path: string) {
  return `${baseUrl}#${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildAbsoluteAppUrl(path: string) {
  return `${window.location.origin}${buildInternalHashPath(path)}`;
}
