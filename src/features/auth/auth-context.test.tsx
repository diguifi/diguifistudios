import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { AuthProvider, useAuth } from './auth-context';

function jsonResponse(data: unknown, init?: ResponseInit) {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      ...init
    })
  );
}

function AuthHarness() {
  const { authState, user, logout } = useAuth();

  return (
    <div>
      <span>{authState}</span>
      <span>{user?.email ?? 'no-user'}</span>
      <button type="button" onClick={() => void logout()}>
        logout
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  test('stays anonymous and skips refresh when there is no stored token', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await screen.findByText('anonymous');
    expect(screen.getByText('no-user')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('hydrates the authenticated user after refresh', async () => {
    window.localStorage.setItem('auth.refreshToken', 'stored-refresh-token');

    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse({ ok: true }))
      .mockImplementationOnce(() =>
        jsonResponse({
          id: 'user_01',
          email: 'player@diguifi.studio',
          name: 'Diguifi Player'
        })
      );

    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await screen.findByText('authenticated');
    expect(screen.getByText('player@diguifi.studio')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/api\/auth\/refresh$/),
      expect.objectContaining({ method: 'POST' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/api\/auth\/me$/),
      expect.objectContaining({ method: 'GET' })
    );
  });

  test('hydrates the authenticated user from the stored access token without forcing refresh', async () => {
    window.localStorage.setItem('auth.accessToken', 'stored-access-token');

    const fetchMock = vi.fn().mockImplementationOnce(() =>
      jsonResponse({
        id: 'user_01',
        email: 'player@diguifi.studio',
        name: 'Diguifi Player'
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await screen.findByText('authenticated');
    expect(screen.getByText('player@diguifi.studio')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/api\/auth\/me$/),
      expect.objectContaining({ method: 'GET' })
    );
  });

  test('falls back to anonymous when refresh returns 401', async () => {
    window.localStorage.setItem('jwt', 'expired-jwt');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 }))
    );

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await screen.findByText('anonymous');
    expect(screen.getByText('no-user')).toBeInTheDocument();
    expect(window.localStorage.getItem('jwt')).toBeNull();
  });

  test('logs out and clears the authenticated user', async () => {
    window.localStorage.setItem('jwt', 'stored-jwt');

    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse({ ok: true }))
      .mockImplementationOnce(() =>
        jsonResponse({
          id: 'user_01',
          email: 'player@diguifi.studio',
          name: 'Diguifi Player'
        })
      )
      .mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 204 })));

    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    const user = userEvent.setup();
    await screen.findByText('authenticated');
    await user.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByText('anonymous')).toBeInTheDocument();
    });
    expect(screen.getByText('no-user')).toBeInTheDocument();
    expect(window.localStorage.getItem('jwt')).toBeNull();
  });
});
