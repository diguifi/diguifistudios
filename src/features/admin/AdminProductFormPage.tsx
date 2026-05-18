import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, ApiError } from '../../shared/api/client';
import { useAuth } from '../auth/auth-context';
import { NotFoundPage } from '../../app/NotFoundPage';
import { PRODUCT_CATEGORIES } from './types';
import type { AdminProduct, ProductFormData } from './types';

const EMPTY_FORM: ProductFormData = {
  slug: '',
  name: '',
  description: '',
  category: 0,
  price: 0,
  currency: 'BRL',
  stripeProductId: '',
  stripePriceId: '',
  isActive: true
};

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { authState, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = authState === 'authenticated' && user?.isAdmin === true;
  const isPending = authState === 'refreshing' || authState === 'authenticating';

  useEffect(() => {
    if (!isEdit || !isAdmin) return;
    apiClient
      .get<AdminProduct>(`/api/produto/${id}`)
      .then(product => {
        setForm({
          slug: product.slug,
          name: product.name,
          description: product.description,
          category: PRODUCT_CATEGORIES.find(c => c.key === product.category)?.value ?? 0,
          price: product.price,
          currency: product.currency,
          stripeProductId: product.stripeProductId ?? '',
          stripePriceId: product.stripePriceId ?? '',
          isActive: product.isActive
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isEdit, isAdmin]);

  if (isPending) return null;
  if (!isAdmin) return <NotFoundPage />;

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'price'
            ? parseFloat(value) || 0
            : name === 'category'
              ? parseInt(value, 10)
              : value
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        ...form,
        stripeProductId: form.stripeProductId || null,
        stripePriceId: form.stripePriceId || null
      };
      if (isEdit) {
        await apiClient.put(`/api/produto/${id}`, body);
      } else {
        await apiClient.post('/api/produto', body);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar produto.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>{isEdit ? 'Edit product' : 'New product'}</h1>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form className="admin-form" onSubmit={e => void handleSubmit(e)}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                name="slug"
                type="text"
                value={form.slug}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {PRODUCT_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="currency">Currency</label>
              <input
                id="currency"
                name="currency"
                type="text"
                value={form.currency}
                onChange={handleChange}
                required
                maxLength={3}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="stripeProductId">Stripe Product ID</label>
              <input
                id="stripeProductId"
                name="stripeProductId"
                type="text"
                value={form.stripeProductId}
                onChange={handleChange}
                placeholder="prod_..."
              />
            </div>
            <div className="form-field">
              <label htmlFor="stripePriceId">Stripe Price ID</label>
              <input
                id="stripePriceId"
                name="stripePriceId"
                type="text"
                value={form.stripePriceId}
                onChange={handleChange}
                placeholder="price_..."
              />
            </div>
          </div>

          <label className="form-checkbox">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Active
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
