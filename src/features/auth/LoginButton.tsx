import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from './auth-context';

interface LoginButtonProps {
  nextPath?: string;
  text?: string;
}

export function LoginButton({
  nextPath = '/store',
  text = 'Continue with Google'
}: LoginButtonProps) {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      navigate('/login?error=missing_credential', { replace: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginWithGoogle({
        idToken: credentialResponse.credential,
        credential: credentialResponse.credential
      });

      navigate(result.needsFill ? '/store' : nextPath, { replace: true });
    } catch {
      navigate('/login?error=auth_failed', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="google-login-shell" aria-label={text}>
      <div className={`google-login-slot ${isSubmitting ? 'is-pending' : ''}`}>
        <GoogleLogin
          onSuccess={(response) => void handleSuccess(response)}
          onError={() => navigate('/login?error=auth_failed', { replace: true })}
          text="signin_with"
          width="100%"
        />
      </div>

      {isSubmitting ? (
        <div className="google-login-feedback" role="status" aria-live="polite">
          <span className="google-login-spinner" aria-hidden="true" />
          <span>Finishing sign-in. Please wait a few seconds.</span>
        </div>
      ) : null}
    </div>
  );
}
