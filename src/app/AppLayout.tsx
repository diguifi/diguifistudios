import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-context';

const links = [
  { to: '/', label: 'Portfolio' },
  { to: '/store', label: 'Store' }
] as const;

function UserMenu({ name, isAdmin, logout }: { name: string; isAdmin: boolean; logout: () => void }) {
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
          {isAdmin && (
            <Link
              to="/admin/products"
              className="user-menu-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Products
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/bundles"
              className="user-menu-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Bundles
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/game-notion-players"
              className="user-menu-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Game Notion Players
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/notifications"
              className="user-menu-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Notifications
            </Link>
          )}
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

function BellButton({ hasNotification }: { hasNotification: boolean }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="bell-btn"
      aria-label="Notifications"
      onClick={() => navigate('/notifications')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {hasNotification && <span className="bell-dot" aria-hidden="true" />}
    </button>
  );
}

export function AppLayout() {
  const location = useLocation();
  const { authState, user, logout, checkNotifications } = useAuth();

  useEffect(() => {
    void checkNotifications();
  }, [location.pathname, checkNotifications]);
  const loginPath = location.pathname === '/login'
    ? `/login${location.search}`
    : `/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`;

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
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
                <BellButton hasNotification={user.hasNotification} />
                <UserMenu
                  name={user.firstName ?? user.name}
                  isAdmin={user.isAdmin}
                  logout={logout}
                />
              </>
            ) : authState === 'refreshing' || authState === 'authenticating' ? (
              <span className="user-chip">Restoring session...</span>
            ) : (
              <Link className="primary-button" to={loginPath}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <Link to="/privacy" className="footer-link">Privacy Policy</Link>
        <span className="footer-sep">·</span>
        <span>Discord: @diguifi</span>
      </footer>
    </div>
  );
}
