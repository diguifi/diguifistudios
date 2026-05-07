import { afterEach, describe, expect, it, vi } from 'vitest';
import { redirectToUrl } from './navigation';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('redirectToUrl', () => {
  it('calls window.location.assign with the provided URL', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { assign });
    redirectToUrl('https://example.com/redirect');
    expect(assign).toHaveBeenCalledWith('https://example.com/redirect');
  });

  it('forwards any URL string', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { assign });
    redirectToUrl('https://checkout.stripe.com/pay/cs_test');
    expect(assign).toHaveBeenCalledWith('https://checkout.stripe.com/pay/cs_test');
  });
});
