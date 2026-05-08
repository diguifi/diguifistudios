import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiError } from '../../shared/api/client';
import { useAuth } from '../auth/auth-context';
import { NotFoundPage } from '../../app/NotFoundPage';
import type { AdminBundle } from './types';

export function AdminBundlesPage() {
  const { authState, user } = useAuth();
  const [bundles, setBundles] = useState<AdminBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = authState === 'authenticated' && user?.isAdmin === true;
  const isPending = authState === 'refreshing' || authState === 'authenticating';

  useEffect(() => {
    if (!isAdmin) return;
    apiClient
      .get<AdminBundle[]>('/api/bundle')
      .then(setBundles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (isPending) return null;
  if (!isAdmin) return <NotFoundPage />;

  async function handleDelete(productId: string, productName: string) {
    if (!confirm(`Excluir bundle de "${productName}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(productId);
    try {
      await apiClient.delete(`/api/bundle/${productId}`);
      setBundles(prev => prev.filter(b => b.productId !== productId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao excluir bundle.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-stack admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Bundles</h1>
        </div>
        <Link to="/admin/bundles/new" className="primary-button">
          New bundle
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : bundles.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No bundles yet.</p>
      ) : (
        <div className="admin-list">
          {bundles.map(bundle => (
            <div key={bundle.productId} className="admin-row">
              <div className="admin-row-info">
                <span className="admin-row-name">{bundle.productName}</span>
                <span className="admin-row-slug">{bundle.fileName}</span>
              </div>
              <div className="admin-row-actions">
                <Link
                  to={`/admin/bundles/${bundle.productId}/edit`}
                  className="ghost-button admin-action-btn"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="danger-button admin-action-btn"
                  onClick={() => void handleDelete(bundle.productId, bundle.productName)}
                  disabled={deletingId === bundle.productId}
                >
                  {deletingId === bundle.productId ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
