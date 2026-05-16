import { useEffect } from 'react';

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  robots?: string;
  schema?: Record<string, unknown> | Record<string, unknown>[];
};

const SITE_NAME = 'Diguifi Studios';
const DEFAULT_IMAGE = 'https://diguifi.com/og-cover.png';

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

function upsertJsonLd(id: string, schema: Record<string, unknown> | Record<string, unknown>[]) {
  let element = document.head.querySelector<HTMLScriptElement>(`script[data-seo-schema="${id}"]`);

  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.setAttribute('data-seo-schema', id);
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(schema);
}

export function buildCanonicalUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, window.location.origin).toString();
}

export function useSeo({
  title,
  description,
  path = '/',
  keywords = [],
  image = DEFAULT_IMAGE,
  type = 'website',
  robots = 'index,follow',
  schema
}: SeoOptions) {
  useEffect(() => {
    const canonicalUrl = buildCanonicalUrl(path);
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

    document.title = fullTitle;

    document.documentElement.lang = 'en';

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords.join(', ') });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description
    });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

    if (schema) {
      upsertJsonLd('primary', schema);
    }
  }, [description, image, keywords, path, robots, schema, title, type]);
}
