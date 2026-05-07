import { useEffect, useState } from 'react';
import { apiClient } from '../../shared/api/client';
import { OrderActions } from './OrderActions';
import type { Order } from './types';

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  expired: 'Expired',
  refunded: 'Refunded'
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(iso));
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Order[]>('/api/orders')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-stack orders-page">
      <section className="section-heading">
        <p className="eyebrow">Account</p>
        <h1>My Orders</h1>
      </section>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-row">
              <div className="order-info">
                <span className="order-product">{order.productName}</span>
                <span className="order-date">{formatDate(order.createdAt)}</span>
              </div>
              <div className="order-meta">
                <span className={`order-status order-status--${order.status}`}>
                  {statusLabel[order.status] ?? order.status}
                </span>
                {order.cancelAtPeriodEnd && (
                  <span className="order-status order-status--cancelling">Cancels at period end</span>
                )}
                <span className="order-amount">{formatPrice(order.amount, order.currency)}</span>
              </div>
              <OrderActions order={order} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
