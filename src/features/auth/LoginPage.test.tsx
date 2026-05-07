import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

const mockUseAuth = vi.fn();

vi.mock('./auth-context', () => ({
  useAuth: () => mockUseAuth()
}));

vi.mock('./LoginButton', () => ({
  LoginButton: ({ text }: { text?: string }) => <button>{text ?? 'Continue with Google'}</button>
}));

function renderLogin(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/login${search}`]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/store" element={<div>Store page</div>} />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('LoginPage', () => {
  it('redirects authenticated user to default /store', () => {
    mockUseAuth.mockReturnValue({ authState: 'authenticated', user: { email: 'u@example.com' } });
    renderLogin();
    expect(screen.getByText('Store page')).toBeInTheDocument();
  });

  it('redirects authenticated user to next param', () => {
    mockUseAuth.mockReturnValue({ authState: 'authenticated', user: { email: 'u@example.com' } });
    renderLogin('?next=%2F');
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('does not redirect while refreshing', () => {
    mockUseAuth.mockReturnValue({ authState: 'refreshing', user: { email: 'u@example.com' } });
    renderLogin();
    expect(screen.getByText('Diguifi Studios Account')).toBeInTheDocument();
  });

  it('shows login form when anonymous', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
    mockUseAuth.mockReturnValue({ authState: 'anonymous', user: null });
    renderLogin();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
  });

  it('shows missing client id message when VITE_GOOGLE_CLIENT_ID is not set', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    mockUseAuth.mockReturnValue({ authState: 'anonymous', user: null });
    renderLogin();
    expect(screen.getByText(/Google sign-in is not configured/i)).toBeInTheDocument();
  });

  it('shows auth_failed error message from query param', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-id');
    mockUseAuth.mockReturnValue({ authState: 'anonymous', user: null });
    renderLogin('?error=auth_failed');
    expect(screen.getByText(/Unable to sign in with Google/i)).toBeInTheDocument();
  });

  it('shows missing_credential error message from query param', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-id');
    mockUseAuth.mockReturnValue({ authState: 'anonymous', user: null });
    renderLogin('?error=missing_credential');
    expect(screen.getByText(/Google did not return the credential/i)).toBeInTheDocument();
  });

  it('shows fallback message for unknown error code', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-id');
    mockUseAuth.mockReturnValue({ authState: 'anonymous', user: null });
    renderLogin('?error=unknown_error');
    expect(screen.getByText('Authentication failed.')).toBeInTheDocument();
  });
});
