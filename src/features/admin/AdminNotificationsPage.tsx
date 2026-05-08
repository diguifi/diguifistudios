import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiError } from '../../shared/api/client';
import { useAuth } from '../auth/auth-context';
import { NotFoundPage } from '../../app/NotFoundPage';
import type { AdminNotification } from './types';

export function AdminNotificationsPage() {
  const { authState, user } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = authState === 'authenticated' && user?.isAdmin === true;
  const isPending = authState === 'refreshing' || authState === 'authenticating';

  useEffect(() => {
    if (!isAdmin) return;
    apiClient
      .get<AdminNotification[]>('/api/notifications')
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (isPending) return null;
  if (!isAdmin) return <NotFoundPage />;

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta notificação? Esta ação não pode ser desfeita.')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao excluir notificação.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-stack admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Notifications</h1>
        </div>
        <Link to="/admin/notifications/new" className="primary-button">
          New notification
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No notifications yet.</p>
      ) : (
        <div className="admin-list">
          {notifications.map(notification => (
            <div key={notification.id} className="admin-row">
              <div className="admin-row-info">
                <span className="admin-row-name">{notification.text}</span>
                <span className="admin-row-slug">
                  User: {notification.userId} &middot;{' '}
                  {new Date(notification.createdAt).toLocaleString()} &middot;{' '}
                  {notification.isRead ? 'Read' : 'Unread'}
                  {notification.path ? ` · ${notification.path}` : ''}
                </span>
              </div>
              <div className="admin-row-actions">
                <Link
                  to={`/admin/notifications/${notification.id}/edit`}
                  className="ghost-button admin-action-btn"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="danger-button admin-action-btn"
                  onClick={() => void handleDelete(notification.id)}
                  disabled={deletingId === notification.id}
                >
                  {deletingId === notification.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
