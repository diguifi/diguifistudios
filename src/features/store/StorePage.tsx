import { useState } from 'react';
import { useAuth } from '../auth/auth-context';
import { apiClient } from '../../shared/api/client';
import { buildAbsoluteAppUrl } from '../../shared/config';
import type { CheckoutSessionRequest, CheckoutSessionResponse, Product } from './types';

const mockProduct: Product = {
  id: 'diguifi-supporter-pack',
  name: 'Diguifi Supporter Pack',
  description: 'A mock product that validates authenticated checkout plumbing before Stripe goes live.',
  priceLabel: '$4.99',
  category: 'bundle'
};

export function StorePage() {
  const { authState } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (authState !== 'authenticated') {
      setStatus('Login is required before starting checkout.');
      return;
    }

    setIsLoading(true);
    setStatus(null);

    const payload: CheckoutSessionRequest = {
      productId: mockProduct.id,
      returnUrl: buildAbsoluteAppUrl('/store?checkout=success'),
      cancelUrl: buildAbsoluteAppUrl('/store?checkout=cancelled')
    };

    try {
      const response = await apiClient.post<CheckoutSessionResponse>(
        '/api/produto/checkout-session',
        payload
      );
      setStatus(`Checkout session created: ${response.checkoutUrl}`);
    } catch {
      setStatus('Checkout is temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-stack store-page">
      <section className="section-heading">
        <p className="eyebrow">Storefront</p>
        <h1>Tiny Store</h1>
        <p>
          Any support is deeply appreciated!
        </p>
      </section>

      <article className="product-card">
        <div>
          <p className="eyebrow">{mockProduct.category}</p>
          <h2>{mockProduct.name}</h2>
          <p>{mockProduct.description}</p>
        </div>
        <div className="product-meta">
          <strong>{mockProduct.priceLabel}</strong>
          <button type="button" className="primary-button" onClick={() => void handleCheckout()}>
            {isLoading ? 'Starting checkout...' : 'Buy now'}
          </button>
        </div>
      </article>

      {status ? <p className="status-banner">{status}</p> : null}
    </div>
  );
}
