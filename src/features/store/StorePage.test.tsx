import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import * as apiModule from '../../shared/api/client';
import * as navigationModule from '../../shared/navigation';
import { StorePage } from './StorePage';
import type { Product } from './types';

const mockProducts: Product[] = [
  {
    id: 'supporter-pack',
    name: 'Diguifi Supporter Pack',
    description: 'Support my work with a small monthly donation.',
    price: 10,
    currency: 'BRL',
    category: 'bundle',
    isActive: true
  }
];

let authState: 'anonymous' | 'authenticated' = 'anonymous';

vi.mock('../auth/auth-context', () => ({
  useAuth: () => ({ authState })
}));

describe('StorePage', () => {
  test('blocks checkout for anonymous users', async () => {
    authState = 'anonymous';
    const user = userEvent.setup();
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(mockProducts);
    const postSpy = vi.spyOn(apiModule.apiClient, 'post');

    render(<StorePage />);
    await screen.findByRole('button', { name: /buy now/i });
    await user.click(screen.getByRole('button', { name: /buy now/i }));

    expect(screen.getByText(/login is required before starting checkout/i)).toBeInTheDocument();
    expect(postSpy).not.toHaveBeenCalled();
  });

  test('creates a checkout session for authenticated users', async () => {
    authState = 'authenticated';
    const user = userEvent.setup();
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(mockProducts);
    const redirectSpy = vi.spyOn(navigationModule, 'redirectToUrl').mockImplementation(() => undefined);
    vi.spyOn(apiModule.apiClient, 'post').mockResolvedValue({
      checkoutUrl: 'https://checkout.stripe.test/session/mock'
    });

    render(<StorePage />);
    await screen.findByRole('button', { name: /buy now/i });
    await user.click(screen.getByRole('button', { name: /buy now/i }));

    expect(redirectSpy).toHaveBeenCalledWith('https://checkout.stripe.test/session/mock');
  });
});
