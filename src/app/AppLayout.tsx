import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-context';

const links = [
  { to: '/', label: 'Portfolio' },
  { to: '/store', label: 'Store' }
] as const;

function UserMenu({ name, logout }: { name: string; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-chip user-menu-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {name}
      </button>
      {open && (
        <div className="user-menu-dropdown" role="menu">
          <Link
            to="/orders"
            className="user-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My Orders
          </Link>
          <button
            type="button"
            className="user-menu-item user-menu-item--danger"
            role="menuitem"
            onClick={() => { void logout(); setOpen(false); }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  const location = useLocation();
  const { authState, user, logout } = useAuth();
  const loginPath = `/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`;

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
            <UserMenu name={user.firstName ?? user.name} logout={logout} />
          ) : authState === 'refreshing' || authState === 'authenticating' ? (
            <span className="user-chip">Restoring session...</span>
          ) : (
            <Link className="primary-button" to={loginPath}>
              Login with Google
            </Link>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
