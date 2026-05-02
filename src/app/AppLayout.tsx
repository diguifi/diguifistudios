import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-context';
import { buildLoginHref } from '../shared/config';

const links = [
  { to: '/', label: 'Portfolio' },
  { to: '/store', label: 'Store' }
] as const;

export function AppLayout() {
  const location = useLocation();
  const { authState, user, logout } = useAuth();
  const loginHref = buildLoginHref(location.pathname);

  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink to="/" className="brand-mark">
          <span>Diguifi</span>
          <span>Studios</span>
        </NavLink>

        <nav className="main-nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="session-actions">
          {authState === 'authenticated' && user ? (
            <>
              <span className="user-chip">Signed in as {user.firstName ?? user.name}</span>
              <button type="button" className="ghost-button" onClick={() => void logout()}>
                Logout
              </button>
            </>
          ) : (
            <a
              className="primary-button"
              href={loginHref}
            >
              Login with Google
            </a>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
