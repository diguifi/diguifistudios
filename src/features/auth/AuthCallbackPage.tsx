import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context';
import type { GoogleAuthPayload } from './types';

function buildGooglePayload(search: string, callbackPath: string): GoogleAuthPayload {
  const params = new URLSearchParams(search);

  return {
    code: params.get('code') ?? undefined,
    credential: params.get('credential') ?? undefined,
    state: params.get('state') ?? undefined,
    scope: params.get('scope') ?? undefined,
    authuser: params.get('authuser') ?? undefined,
    prompt: params.get('prompt') ?? undefined,
    error: params.get('error') ?? undefined,
    callbackPath
  };
}

export function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { pathname, search } = location;

  useEffect(() => {
    const next = new URLSearchParams(search).get('next') ?? '/';
    const payload = buildGooglePayload(search, pathname);

    if (!payload.code && !payload.credential) {
      setError('Missing OAuth payload from Google redirect.');
      return;
    }

    void loginWithGoogle(payload)
      .then(() => {
        navigate(next, { replace: true });
      })
      .catch(() => {
        setError('Unable to complete Google login right now.');
      });
  }, [loginWithGoogle, navigate, pathname, search]);

  return (
    <section className="callback-card">
      <p className="eyebrow">Authentication</p>
      <h1>Finalizing your session</h1>
      {error ? (
        <>
          <p>{error}</p>
          <Link className="primary-button" to="/">
            Return home
          </Link>
        </>
      ) : (
        <p>We are validating the Google response and restoring your account.</p>
      )}
    </section>
  );
}
