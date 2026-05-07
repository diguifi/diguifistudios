import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as apiModule from '../../shared/api/client';
import { OrdersPage } from './OrdersPage';
import type { Order } from './types';

const orders: Order[] = [
  {
    id: 'order-1',
    productName: 'Supporter Pack',
    productCategory: 'subscription',
    status: 'paid',
    amount: 100,
    currency: 'BRL',
    createdAt: '2024-06-15T10:00:00Z',
    paidAt: '2024-06-15T10:01:00Z'
  },
  {
    id: 'order-2',
    productName: 'Bundle Deal',
    productCategory: 'bundle',
    status: 'pending',
    amount: 50,
    currency: 'BRL',
    createdAt: '2024-07-01T08:00:00Z',
    paidAt: null
  }
];

describe('OrdersPage', () => {
  it('shows loading state initially', () => {
    vi.spyOn(apiModule.apiClient, 'get').mockReturnValue(new Promise(() => {}));
    render(<OrdersPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no orders', async () => {
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue([]);
    render(<OrdersPage />);
    expect(await screen.findByText('No orders yet.')).toBeInTheDocument();
  });

  it('renders order product names', async () => {
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(orders);
    render(<OrdersPage />);
    expect(await screen.findByText('Supporter Pack')).toBeInTheDocument();
    expect(screen.getByText('Bundle Deal')).toBeInTheDocument();
  });

  it('renders status labels', async () => {
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(orders);
    render(<OrdersPage />);
    await screen.findByText('Paid');
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders unknown status as-is', async () => {
    const withUnknown: Order[] = [
      { ...orders[0], status: 'refunded' }
    ];
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(withUnknown);
    render(<OrdersPage />);
    expect(await screen.findByText('Refunded')).toBeInTheDocument();
  });

  it('silently handles API errors', async () => {
    vi.spyOn(apiModule.apiClient, 'get').mockRejectedValue(new Error('Network error'));
    render(<OrdersPage />);
    expect(await screen.findByText('No orders yet.')).toBeInTheDocument();
  });
});
