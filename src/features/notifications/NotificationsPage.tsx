import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client';
import { useAuth } from '../auth/auth-context';

interface Notification {
  id: string;
  text: string;
  path: string | null;
  createdAt: string;
  isRead: boolean;
}

export function NotificationsPage() {
  const { authState, reloadUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  // IDs that were already read before the page opened — shown dimmed
  const alreadyReadIds = useRef<Set<string>>(new Set());

  const isAuthenticated = authState === 'authenticated';
  const isPending = authState === 'refreshing' || authState === 'authenticating';

  useEffect(() => {
    if (!isAuthenticated) return;

    apiClient
      .get<Notification[]>('/api/my/notifications')
      .then(data => {
        alreadyReadIds.current = new Set(data.filter(n => n.isRead).map(n => n.id));
        setNotifications(data);

        const unread = data.filter(n => !n.isRead);
        if (unread.length === 0) return;

        void apiClient
          .put('/api/my/notifications/read', { ids: unread.map(n => n.id) })
          .then(() => reloadUser());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // reloadUser is stable (useCallback), safe to include
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (isPending) return null;

  return (
    <div className="page-stack">
      <div className="section-heading">
        <h1>Notifications</h1>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No notifications yet.</p>
      ) : (
        <div className="notification-list">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`notification-row${alreadyReadIds.current.has(n.id) ? ' notification-row--read' : ''}`}
            >
              <div className="notification-body">
                <p className="notification-text">{n.text}</p>
                <span className="notification-meta">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              {n.path && (
                <button
                  type="button"
                  className="ghost-button"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => navigate(n.path!)}
                >
                  View
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
