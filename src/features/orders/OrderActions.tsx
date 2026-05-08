import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { apiClient, ApiError } from '../../shared/api/client';
import { redirectToUrl } from '../../shared/navigation';
import type { Order } from './types';

interface Props {
  order: Order;
}

export function OrderActions({ order }: Props) {
  const [setIdOpen, setSetIdOpen] = useState(false);

  if (order.status !== 'paid') return null;
  if (order.productCategory !== 'subscription' && order.productCategory !== 'bundle') return null;
  if (order.productCategory === 'subscription' && order.cancelAtPeriodEnd) return null;

  const isGameNotion = order.productCategory === 'bundle' && order.bundleType === 'gamenotion';

  return (
    <>
      <KebabMenu>
        {order.productCategory === 'subscription' && (
          <CancelSubscriptionItem orderId={order.id} />
        )}
        {order.productCategory === 'bundle' && (
          <DownloadBundleItem orderId={order.id} />
        )}
        {isGameNotion && (
          <button
            className="order-kebab-item"
            onClick={() => setSetIdOpen(true)}
          >
            Set Id
          </button>
        )}
      </KebabMenu>
      {isGameNotion && setIdOpen && (
        <SetGameNotionIdModal onClose={() => setSetIdOpen(false)} />
      )}
    </>
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

function SetGameNotionIdModal({ onClose }: { onClose: () => void }) {
  const [playerId, setPlayerId] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await apiClient.put('/api/game-notion-players/me', { playerId });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to set Player ID. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="set-id-title" className="modal">
        <h2 id="set-id-title">Set Player ID</h2>
        <form onSubmit={e => void handleSubmit(e)}>
          <div className="form-field">
            <label htmlFor="player-id-input">Player ID</label>
            <input
              id="player-id-input"
              type="text"
              value={playerId}
              onChange={e => setPlayerId(e.target.value)}
              required
              maxLength={100}
              autoFocus
            />
          </div>
          {error && <p role="alert">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={sending}>
              {sending ? 'Sending...' : 'Send'}
            </button>
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
