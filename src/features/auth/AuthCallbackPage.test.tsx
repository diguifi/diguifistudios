import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthCallbackPage } from './AuthCallbackPage';

const mockLoginWithGoogle = vi.fn();

vi.mock('./auth-context', () => ({
  useAuth: () => ({ loginWithGoogle: mockLoginWithGoogle })
}));

function renderCallback(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/auth/callback${search}`]}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthCallbackPage', () => {
  it('shows error when no code or credential in URL', async () => {
    renderCallback('?state=some-state');
    expect(await screen.findByText('Missing OAuth payload from Google redirect.')).toBeInTheDocument();
  });

  it('shows return home link on error', async () => {
    renderCallback('?state=some-state');
    expect(await screen.findByText('Return home')).toBeInTheDocument();
  });

  it('shows validating message while processing', () => {
    mockLoginWithGoogle.mockReturnValue(new Promise(() => {}));
    renderCallback('?code=auth-code');
    expect(screen.getByText(/validating the Google response/i)).toBeInTheDocument();
  });

  it('calls loginWithGoogle with code and navigates on success', async () => {
    mockLoginWithGoogle.mockResolvedValue({ needsFill: false });
    renderCallback('?code=auth-code&next=%2F');
    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'auth-code' })
      );
    });
    expect(await screen.findByText('Home page')).toBeInTheDocument();
  });

  it('calls loginWithGoogle with credential when present', async () => {
    mockLoginWithGoogle.mockResolvedValue({ needsFill: false });
    renderCallback('?credential=google-credential');
    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalledWith(
        expect.objectContaining({ credential: 'google-credential' })
      );
    });
  });

  it('shows error message when loginWithGoogle throws', async () => {
    mockLoginWithGoogle.mockRejectedValue(new Error('Auth failed'));
    renderCallback('?code=auth-code');
    expect(await screen.findByText('Unable to complete Google login right now.')).toBeInTheDocument();
  });
});
