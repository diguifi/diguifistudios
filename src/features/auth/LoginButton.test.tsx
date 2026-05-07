import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginButton } from './LoginButton';

type GoogleLoginProps = {
  onSuccess: (r: { credential?: string }) => void;
  onError: () => void;
};

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }: GoogleLoginProps) => (
    <div>
      <button onClick={() => onSuccess({ credential: 'test-credential' })}>
        Google Sign In
      </button>
      <button onClick={() => onError()}>
        Trigger Error
      </button>
      <button onClick={() => onSuccess({})}>
        Sign In Without Credential
      </button>
    </div>
  )
}));

const mockLoginWithGoogle = vi.fn();
const mockNavigate = vi.fn();

vi.mock('./auth-context', () => ({
  useAuth: () => ({ loginWithGoogle: mockLoginWithGoogle })
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderButton(nextPath?: string) {
  return render(<LoginButton nextPath={nextPath} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginButton', () => {
  it('navigates to nextPath on successful login', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockResolvedValue({ needsFill: false });
    renderButton('/store');
    await user.click(screen.getByText('Google Sign In'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/store', { replace: true });
    });
  });

  it('navigates to /store when needsFill is true', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockResolvedValue({ needsFill: true });
    renderButton('/');
    await user.click(screen.getByText('Google Sign In'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/store', { replace: true });
    });
  });

  it('shows pending spinner while submitting', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockReturnValue(new Promise(() => {}));
    renderButton('/store');
    await user.click(screen.getByText('Google Sign In'));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('navigates to login error page when loginWithGoogle throws', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockRejectedValue(new Error('Auth failed'));
    renderButton('/store');
    await user.click(screen.getByText('Google Sign In'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/login?error=auth_failed',
        { replace: true }
      );
    });
  });

  it('navigates to missing_credential error when credential is absent', async () => {
    const user = userEvent.setup();
    renderButton('/store');
    await user.click(screen.getByText('Sign In Without Credential'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/login?error=missing_credential',
        { replace: true }
      );
    });
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
  });

  it('navigates to auth_failed on GoogleLogin onError', async () => {
    const user = userEvent.setup();
    renderButton('/store');
    await user.click(screen.getByText('Trigger Error'));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/login?error=auth_failed',
      { replace: true }
    );
  });
});
