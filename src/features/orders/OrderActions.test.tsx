import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as apiModule from '../../shared/api/client';
import * as navigationModule from '../../shared/navigation';
import { OrderActions } from './OrderActions';
import type { Order } from './types';

vi.mock('../../shared/navigation', () => ({
  redirectToUrl: vi.fn(),
}));

describe('OrderActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── Renderização condicional por categoria e status ───────────────────────

  it('renders Cancel Subscription button for subscription order with paid status', async () => {
    const user = userEvent.setup();
    render(<OrderActions order={buildOrder({ productCategory: 'subscription', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    expect(screen.getByRole('button', { name: /cancel subscription/i })).toBeInTheDocument();
  });

  it('renders Download Bundle button for bundle order with paid status', async () => {
    const user = userEvent.setup();
    render(<OrderActions order={buildOrder({ productCategory: 'bundle', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    expect(screen.getByRole('button', { name: /download bundle/i })).toBeInTheDocument();
  });

  it('renders nothing for service order', () => {
    const { container } = render(<OrderActions order={buildOrder({ productCategory: 'service', status: 'paid' })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for donation order', () => {
    const { container } = render(<OrderActions order={buildOrder({ productCategory: 'donation', status: 'paid' })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(['pending', 'failed', 'expired', 'refunded', 'cancelled'] as const)(
    'renders nothing when order status is %s',
    (status) => {
      const { container } = render(
        <OrderActions order={buildOrder({ productCategory: 'subscription', status })} />
      );
      expect(container).toBeEmptyDOMElement();
    }
  );

  // ── CancelSubscriptionButton ──────────────────────────────────────────────

  it('calls POST /api/orders/{id}/cancel-subscription with the correct orderId', async () => {
    const user = userEvent.setup();
    const postSpy = vi.spyOn(apiModule.apiClient, 'post').mockResolvedValue({ portalUrl: 'https://portal' });

    render(<OrderActions order={buildOrder({ id: 'order-abc', productCategory: 'subscription', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    await user.click(screen.getByRole('button', { name: /cancel subscription/i }));

    expect(postSpy).toHaveBeenCalledWith('/api/orders/order-abc/cancel-subscription');
  });

  it('redirects to portalUrl on successful cancel subscription', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiModule.apiClient, 'post').mockResolvedValue({ portalUrl: 'https://billing.stripe.com/session/test' });

    render(<OrderActions order={buildOrder({ productCategory: 'subscription', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    await user.click(screen.getByRole('button', { name: /cancel subscription/i }));

    expect(navigationModule.redirectToUrl).toHaveBeenCalledWith('https://billing.stripe.com/session/test');
  });

  it('shows error message when cancel subscription API call fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiModule.apiClient, 'post').mockRejectedValue(new Error('Network error'));

    render(<OrderActions order={buildOrder({ productCategory: 'subscription', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    await user.click(screen.getByRole('button', { name: /cancel subscription/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('does not redirect when cancel subscription API call fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiModule.apiClient, 'post').mockRejectedValue(new Error('Network error'));

    render(<OrderActions order={buildOrder({ productCategory: 'subscription', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    await user.click(screen.getByRole('button', { name: /cancel subscription/i }));

    await screen.findByRole('alert');
    expect(navigationModule.redirectToUrl).not.toHaveBeenCalled();
  });

  it('disables Cancel Subscription button while the request is in flight', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiModule.apiClient, 'post').mockReturnValue(new Promise(() => {}));

    render(<OrderActions order={buildOrder({ productCategory: 'subscription', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    await user.click(screen.getByRole('button', { name: /cancel subscription/i }));

    expect(screen.getByRole('button', { name: /cancel subscription/i })).toBeDisabled();
  });

  // ── DownloadBundleButton ──────────────────────────────────────────────────

  it('calls GET /api/orders/{id}/bundle-download with the correct orderId', async () => {
    const user = userEvent.setup();
    const getSpy = vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue({
      downloadUrl: 'https://drive.google.com/file/x',
      fileName: 'bundle.zip',
    });

    render(<OrderActions order={buildOrder({ id: 'order-xyz', productCategory: 'bundle', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    await user.click(screen.getByRole('button', { name: /download bundle/i }));

    expect(getSpy).toHaveBeenCalledWith('/api/orders/order-xyz/bundle-download');
  });

  it('opens downloadUrl in a new tab on successful bundle download', async () => {
    const user = userEvent.setup();
    const windowOpen = vi.fn();
    vi.stubGlobal('open', windowOpen);
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue({
      downloadUrl: 'https://drive.google.com/file/abc',
      fileName: 'diguifi-bundle-v1.zip',
    });

    render(<OrderActions order={buildOrder({ productCategory: 'bundle', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    await user.click(screen.getByRole('button', { name: /download bundle/i }));

    expect(windowOpen).toHaveBeenCalledWith('https://drive.google.com/file/abc', '_blank', 'noopener');
  });

  it('shows error message when bundle download API call fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiModule.apiClient, 'get').mockRejectedValue(new Error('Network error'));

    render(<OrderActions order={buildOrder({ productCategory: 'bundle', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    await user.click(screen.getByRole('button', { name: /download bundle/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('disables Download Bundle button while the request is in flight', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiModule.apiClient, 'get').mockReturnValue(new Promise(() => {}));

    render(<OrderActions order={buildOrder({ productCategory: 'bundle', status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: /order actions/i }));
    await user.click(screen.getByRole('button', { name: /download bundle/i }));

    expect(screen.getByRole('button', { name: /download bundle/i })).toBeDisabled();
  });

  // ── Helper ────────────────────────────────────────────────────────────────

  function buildOrder(overrides: Partial<Order> = {}): Order {
    return {
      id: 'order-001',
      productName: 'Test Product',
      productCategory: 'subscription',
      status: 'paid',
      amount: 99.90,
      currency: 'BRL',
      createdAt: '2026-01-01T00:00:00Z',
      paidAt: '2026-01-01T01:00:00Z',
      cancelAtPeriodEnd: false,
      ...overrides,
    };
  }
});
