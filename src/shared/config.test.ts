import { describe, expect, it } from 'vitest';
import { buildAbsoluteAppUrl, buildInternalHashPath } from './config';

describe('buildInternalHashPath', () => {
  it('prepends baseUrl to path with leading slash', () => {
    const result = buildInternalHashPath('/foo');
    expect(result).toMatch(/\/foo$/);
  });

  it('adds leading slash to path without one', () => {
    const result = buildInternalHashPath('bar');
    expect(result).toMatch(/\/bar$/);
  });

  it('preserves nested paths', () => {
    const result = buildInternalHashPath('/admin/products');
    expect(result).toMatch(/\/admin\/products$/);
  });
});

describe('buildAbsoluteAppUrl', () => {
  it('returns absolute URL with origin prepended', () => {
    const result = buildAbsoluteAppUrl('/store');
    expect(result).toMatch(/^http:\/\/localhost/);
    expect(result).toMatch(/\/store$/);
  });

  it('includes path without leading slash', () => {
    const result = buildAbsoluteAppUrl('login');
    expect(result).toMatch(/\/login$/);
  });
});
