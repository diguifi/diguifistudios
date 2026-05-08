import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, ApiError } from '../../shared/api/client';
import { useAuth } from '../auth/auth-context';
import { NotFoundPage } from '../../app/NotFoundPage';
import type { AdminNotification, NotificationFormData } from './types';

const EMPTY_FORM: NotificationFormData = {
  userId: '',
  text: '',
  path: '',
  isRead: false
};

export function AdminNotificationFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { authState, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<NotificationFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = authState === 'authenticated' && user?.isAdmin === true;
  const isPending = authState === 'refreshing' || authState === 'authenticating';

  useEffect(() => {
    if (!isEdit || !isAdmin) return;
    apiClient
      .get<AdminNotification>(`/api/notifications/${id}`)
      .then(n => {
        setForm({ userId: n.userId, text: n.text, path: n.path ?? '', isRead: n.isRead });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isEdit, isAdmin]);

  if (isPending) return null;
  if (!isAdmin) return <NotFoundPage />;

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked! : value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await apiClient.put(`/api/notifications/${id}`, {
          text: form.text,
          path: form.path || null,
          isRead: form.isRead
        });
      } else {
        await apiClient.post('/api/notifications', {
          userId: form.userId,
          text: form.text,
          path: form.path || null
        });
      }
      navigate('/admin/notifications');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar notificação.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>{isEdit ? 'Edit notification' : 'New notification'}</h1>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form className="admin-form" onSubmit={e => void handleSubmit(e)}>
          {!isEdit && (
            <div className="form-field">
              <label htmlFor="userId">User ID</label>
              <input
                id="userId"
                name="userId"
                type="text"
                value={form.userId}
                onChange={handleChange}
                required
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="text">Text</label>
            <textarea
              id="text"
              name="text"
              value={form.text}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          <div className="form-field">
            <label htmlFor="path">Path (optional)</label>
            <input
              id="path"
              name="path"
              type="text"
              value={form.path}
              onChange={handleChange}
              placeholder="/store"
            />
          </div>

          {isEdit && (
            <div className="form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="isRead"
                name="isRead"
                type="checkbox"
                checked={form.isRead}
                onChange={handleChange}
              />
              <label htmlFor="isRead" style={{ margin: 0 }}>Mark as read</label>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update' : 'Send'}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => navigate('/admin/notifications')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
