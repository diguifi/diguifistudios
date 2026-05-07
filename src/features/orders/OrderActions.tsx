import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../shared/api/client';
import { redirectToUrl } from '../../shared/navigation';
import type { Order } from './types';

interface Props {
  order: Order;
}

export function OrderActions({ order }: Props) {
  if (order.status !== 'paid') return null;
  if (order.productCategory !== 'subscription' && order.productCategory !== 'bundle') return null;

  return (
    <KebabMenu>
      {order.productCategory === 'subscription' && (
        <CancelSubscriptionItem orderId={order.id} />
      )}
      {order.productCategory === 'bundle' && (
        <DownloadBundleItem orderId={order.id} />
      )}
    </KebabMenu>
  );
}

function KebabMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return (
    <div className="order-kebab" ref={ref}>
      <button
        className="order-kebab-trigger"
        aria-label="Order actions"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        ⋮
      </button>
      {open && (
        <div className="order-kebab-dropdown" role="menu">
          {children}
        </div>
      )}
    </div>
  );
}

function CancelSubscriptionItem({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<{ portalUrl: string }>(`/api/orders/${orderId}/cancel-subscription`);
      redirectToUrl(data.portalUrl);
    } catch {
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="order-kebab-item order-kebab-item--danger"
        disabled={loading}
        onClick={handleClick}
      >
        Cancel Subscription
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}

function DownloadBundleItem({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<{ downloadUrl: string; fileName: string }>(`/api/orders/${orderId}/bundle-download`);
      window.open(data.downloadUrl, '_blank', 'noopener');
    } catch {
      setError('Failed to download bundle. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="order-kebab-item"
        disabled={loading}
        onClick={handleClick}
      >
        Download Bundle
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
