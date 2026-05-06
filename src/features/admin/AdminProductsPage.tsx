import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiError } from '../../shared/api/client';
import { useAuth } from '../auth/auth-context';
import { NotFoundPage } from '../../app/NotFoundPage';
import type { AdminProduct } from './types';

export function AdminProductsPage() {
  const { authState, user } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = authState === 'authenticated' && user?.isAdmin === true;
  const isPending = authState === 'refreshing' || authState === 'authenticating';

  useEffect(() => {
    if (!isAdmin) return;
    apiClient
      .get<AdminProduct[]>('/api/produto')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (isPending) return null;
  if (!isAdmin) return <NotFoundPage />;

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/api/produto/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao excluir produto.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-stack admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Products</h1>
        </div>
        <Link to="/admin/products/new" className="primary-button">
          New product
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No products yet.</p>
      ) : (
        <div className="admin-list">
          {products.map(product => (
            <div key={product.id} className="admin-row">
              <div className="admin-row-info">
                <span className="admin-row-name">{product.name}</span>
                <span className="admin-row-slug">{product.slug}</span>
              </div>
              <div className="admin-row-actions">
                <Link
                  to={`/admin/products/${product.id}/edit`}
                  className="ghost-button admin-action-btn"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="danger-button admin-action-btn"
                  onClick={() => void handleDelete(product.id, product.name)}
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
