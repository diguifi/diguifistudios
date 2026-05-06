import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { LoginButton } from './LoginButton';
import { useAuth } from './auth-context';

const errorMessages: Record<string, string> = {
  auth_failed: 'Unable to sign in with Google right now.',
  missing_credential: 'Google did not return the credential required to continue.',
  missing_client_id: 'Google sign-in is not configured in this environment yet.'
};

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const { authState, user } = useAuth();
  const nextPath = searchParams.get('next') || '/store';
  const error = searchParams.get('error');
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (authState !== 'refreshing' && authState !== 'authenticating' && user) {
    return <Navigate to={nextPath} replace />;
  }

  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-copy">
          <span className="login-kicker">Diguifi Studios Account</span>
          <h1 className="login-title">Log in or create your account in one step.</h1>
          <p className="login-lead">
            We only use your Google account name and email to identify your account and keep your
            Diguifi Studios profile connected to you.
          </p>

          <div className="login-highlights">
            <div className="login-highlight-card">
              <span className="login-highlight-label">Why sign in</span>
              <p>
                Sign in to keep your session active, access authenticated purchases and connect
                your account to future studio features.
              </p>
            </div>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-panel-glow" aria-hidden="true" />
          <div className="login-card">
            <span className="login-card-eyebrow">Secure sign-in</span>
            <h2>Continue with Google</h2>
            <p>Use the same Google account to create or access your Diguifi Studios profile.</p>

            {googleClientId ? (
              <div className="login-button-wrap">
                <LoginButton nextPath={nextPath} text="Continue with Google" />
              </div>
            ) : (
              <p className="status-banner">
                {errorMessages.missing_client_id}
              </p>
            )}

            {error ? <p className="status-banner">{errorMessages[error] ?? 'Authentication failed.'}</p> : null}

            <p className="login-privacy-note">
              By continuing, you agree to use your Google account only for authentication on
              Diguifi Studios.
            </p>

            <div className="login-links">
              <Link to="/">Back to portfolio</Link>
              <Link to="/store">Open store</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
