import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';
import { apiClient } from '../../shared/api/client';
import { buildAbsoluteAppUrl } from '../../shared/config';
import { redirectToUrl } from '../../shared/navigation';
import { useSeo } from '../../shared/seo';
import type { CheckoutSessionRequest, CheckoutSessionResponse, Product } from './types';

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(price);
}

export function StorePage() {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useSeo({
    title: 'Storefront and Software Releases',
    description:
      'Browse software releases, experiments and paid products from Diguifi Studios.',
    path: '/store',
    keywords: ['diguifi store', 'games store', 'software releases', 'indie development store', 'wallhack', 'webhadar', 'cs2 hack', 'cs2 wallhack', 'cs2 webhadar']
  });

  useEffect(() => {
    apiClient.get<Product[]>('/api/produto')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleCheckout = async (productId: string) => {
    if (authState !== 'authenticated') {
      navigate(`/login?next=${encodeURIComponent('/store')}`);
      return;
    }

    setCheckingOut(productId);
    setStatus(null);

    const payload: CheckoutSessionRequest = {
      productId,
      returnUrl: buildAbsoluteAppUrl('/store?checkout=success&session_id={CHECKOUT_SESSION_ID}'),
      cancelUrl: buildAbsoluteAppUrl('/store?checkout=cancelled')
    };

    try {
      const response = await apiClient.post<CheckoutSessionResponse>(
        '/api/produto/checkout-session',
        payload
      );
      if (!response.checkoutUrl) {
        setStatus('Checkout is temporarily unavailable.');
        return;
      }
      redirectToUrl(response.checkoutUrl);
    } catch {
      setStatus('Checkout is temporarily unavailable.');
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <div className="page-stack store-page">
      <section className="section-heading">
        <p className="eyebrow">Storefront</p>
        <h1>Tiny Store</h1>
        <p>Any support is deeply appreciated!</p>
      </section>

      {loadingProducts ? (
        <div className="store-skeleton">
          {[0, 1, 2].map(i => (
            <article key={i} className="product-card">
              <div className="store-skeleton-info">
                <div className="skeleton skeleton-text skeleton-text--short" />
                <div className="skeleton skeleton-text skeleton-text--long" style={{ height: '1.4em', marginTop: 6 }} />
                <div className="skeleton skeleton-text" style={{ marginTop: 8 }} />
                <div className="skeleton skeleton-text skeleton-text--long" style={{ marginTop: 4 }} />
              </div>
              <div className="product-meta">
                <div className="skeleton skeleton-price" />
                <div className="skeleton skeleton-btn" />
              </div>
            </article>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No products available.</p>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <article key={product.id} className="product-card">
              <div>
                <p className="eyebrow">{product.category}</p>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
              </div>
              <div className="product-meta">
                <strong>{formatPrice(product.price, product.currency)}</strong>
                <button
                  type="button"
                  className={`primary-button${product.isPurchased ? ' primary-button--purchased' : ''}`}
                  onClick={() => void handleCheckout(product.id)}
                  disabled={product.isPurchased || checkingOut === product.id}
                >
                  {product.isPurchased ? 'Purchased' : checkingOut === product.id ? 'Starting...' : 'Buy now'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {status ? <p className="status-banner">{status}</p> : null}
    </div>
  );
}
