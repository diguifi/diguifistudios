import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, ApiError } from '../../shared/api/client';
import { useAuth } from '../auth/auth-context';
import { NotFoundPage } from '../../app/NotFoundPage';
import type { AdminBundle, AdminProduct, BundleFormData } from './types';

const EMPTY_FORM: BundleFormData = {
  productId: '',
  driveUrl: '',
  fileName: ''
};

export function AdminBundleFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const isEdit = !!productId;
  const { authState, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<BundleFormData>(EMPTY_FORM);
  const [bundleProducts, setBundleProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = authState === 'authenticated' && user?.isAdmin === true;
  const isPending = authState === 'refreshing' || authState === 'authenticating';

  useEffect(() => {
    if (!isAdmin) return;

    if (isEdit) {
      apiClient
        .get<AdminBundle>(`/api/bundle/${productId}`)
        .then(bundle => {
          setForm({ productId: bundle.productId, driveUrl: bundle.driveUrl, fileName: bundle.fileName });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      apiClient
        .get<AdminProduct[]>('/api/produto')
        .then(products => setBundleProducts(products.filter(p => p.category === 'bundle')))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [productId, isEdit, isAdmin]);

  if (isPending) return null;
  if (!isAdmin) return <NotFoundPage />;

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const targetId = isEdit ? productId! : form.productId;
      await apiClient.put(`/api/bundle/${targetId}`, {
        driveUrl: form.driveUrl,
        fileName: form.fileName
      });
      navigate('/admin/bundles');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar bundle.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>{isEdit ? 'Edit bundle' : 'New bundle'}</h1>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form className="admin-form" onSubmit={e => void handleSubmit(e)}>
          {isEdit ? (
            <div className="form-field">
              <label>Product</label>
              <input type="text" value={form.productId} disabled />
            </div>
          ) : (
            <div className="form-field">
              <label htmlFor="productId">Product</label>
              <select
                id="productId"
                name="productId"
                value={form.productId}
                onChange={handleChange}
                required
              >
                <option value="">Select a product...</option>
                {bundleProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="driveUrl">Drive URL</label>
            <input
              id="driveUrl"
              name="driveUrl"
              type="url"
              value={form.driveUrl}
              onChange={handleChange}
              required
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="form-field">
            <label htmlFor="fileName">File name</label>
            <input
              id="fileName"
              name="fileName"
              type="text"
              value={form.fileName}
              onChange={handleChange}
              required
              placeholder="pack.zip"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => navigate('/admin/bundles')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
