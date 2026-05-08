import { useEffect, useState } from 'react';
import { useAuth } from '../auth/auth-context';
import { apiClient } from '../../shared/api/client';
import { buildAbsoluteAppUrl } from '../../shared/config';
import { redirectToUrl } from '../../shared/navigation';
import type { CheckoutSessionRequest, CheckoutSessionResponse, Product } from './types';

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(price);
}

export function StorePage() {
  const { authState } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<Product[]>('/api/produto')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleCheckout = async (productId: string) => {
    if (authState !== 'authenticated') {
      setStatus('Login is required before starting checkout.');
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
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        products.map(product => (
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
                {product.isPurchased ? 'Purchased' : checkingOut === product.id ? 'Starting checkout...' : 'Buy now'}
              </button>
            </div>
          </article>
        ))
      )}

      {status ? <p className="status-banner">{status}</p> : null}
    </div>
  );
}
