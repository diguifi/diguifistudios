import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildCanonicalUrl, useSeo } from './seo';

function SeoProbe() {
  useSeo({
    title: 'Indie Development and CS2 Web Radar Projects',
    description: 'Portfolio and software projects from Diguifi Studios.',
    path: '/store',
    keywords: ['diguifi', 'indie development', 'games', 'cs2', 'webradar'],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Diguifi Studios'
    }
  });

  return null;
}

describe('buildCanonicalUrl', () => {
  it('builds an absolute URL for root-relative paths', () => {
    expect(buildCanonicalUrl('/store')).toBe('http://localhost:3000/store');
  });
});

describe('useSeo', () => {
  it('updates document metadata', () => {
    window.history.replaceState({}, '', 'http://localhost:3000/');

    render(<SeoProbe />);

    expect(document.title).toContain('Diguifi Studios');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Portfolio and software projects from Diguifi Studios.'
    );
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'http://localhost:3000/store'
    );
    expect(
      document.head.querySelector('script[data-seo-schema="primary"]')?.textContent
    ).toContain('"@type":"WebSite"');
  });
});
