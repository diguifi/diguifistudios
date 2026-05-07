import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../features/auth/token-storage', () => ({
  getStoredAccessToken: vi.fn().mockReturnValue(null)
}));

import * as tokenStorage from '../../features/auth/token-storage';
import { ApiError, apiClient } from './client';

function stubFetch(status: number, body: unknown) {
  const ok = status >= 200 && status < 300;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status,
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
    json: () => Promise.resolve(body)
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(tokenStorage.getStoredAccessToken).mockReturnValue(null);
});

describe('ApiError', () => {
  it('has correct name, status, and message', () => {
    const error = new ApiError(404, 'Not found');
    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error).toBeInstanceOf(Error);
  });

  it('is detectable with instanceof', () => {
    const error = new ApiError(500, 'Server error');
    expect(error instanceof ApiError).toBe(true);
  });
});

describe('apiClient.get', () => {
  it('sends GET request and returns parsed JSON', async () => {
    const data = { id: 1, name: 'test' };
    stubFetch(200, data);
    const result = await apiClient.get<typeof data>('/api/test');
    expect(result).toEqual(data);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(String(call[0]!)).toMatch('/api/test');
    expect((call[1] as RequestInit).method).toBe('GET');
  });

  it('includes Content-Type header', async () => {
    stubFetch(200, {});
    await apiClient.get('/api/test');
    const headers = (vi.mocked(fetch).mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('does not include Authorization header when no token stored', async () => {
    stubFetch(200, {});
    await apiClient.get('/api/test');
    const headers = (vi.mocked(fetch).mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('includes Authorization header when access token is stored', async () => {
    vi.mocked(tokenStorage.getStoredAccessToken).mockReturnValue('stored-token');
    stubFetch(200, {});
    await apiClient.get('/api/test');
    const headers = (vi.mocked(fetch).mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer stored-token');
  });

  it('throws ApiError on non-ok response', async () => {
    stubFetch(400, 'Bad request');
    await expect(apiClient.get('/api/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws ApiError with response body as message', async () => {
    stubFetch(404, 'Not found');
    try {
      await apiClient.get('/api/test');
    } catch (err) {
      expect(err instanceof ApiError && err.status).toBe(404);
      expect(err instanceof ApiError && err.message).toBe('Not found');
    }
  });

  it('throws ApiError with fallback message on empty error body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('')
    }));
    try {
      await apiClient.get('/api/test');
    } catch (err) {
      expect(err instanceof ApiError && err.message).toBe('Unexpected API error');
    }
  });
});

describe('apiClient.post', () => {
  it('sends POST with JSON body', async () => {
    stubFetch(200, { ok: true });
    await apiClient.post('/api/test', { name: 'payload' });
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect((call[1] as RequestInit).method).toBe('POST');
    expect((call[1] as RequestInit).body).toBe(JSON.stringify({ name: 'payload' }));
  });
});

describe('apiClient.put', () => {
  it('sends PUT with JSON body', async () => {
    stubFetch(200, { ok: true });
    await apiClient.put('/api/test', { name: 'updated' });
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect((call[1] as RequestInit).method).toBe('PUT');
    expect((call[1] as RequestInit).body).toBe(JSON.stringify({ name: 'updated' }));
  });
});

describe('apiClient.delete', () => {
  it('sends DELETE request', async () => {
    stubFetch(204, null);
    await apiClient.delete('/api/test');
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect((call[1] as RequestInit).method).toBe('DELETE');
  });

  it('returns undefined for 204 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      text: () => Promise.resolve(''),
      json: () => Promise.resolve(null)
    }));
    const result = await apiClient.delete('/api/test');
    expect(result).toBeUndefined();
  });
});
