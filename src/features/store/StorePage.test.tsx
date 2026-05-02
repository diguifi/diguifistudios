import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import * as apiModule from '../../shared/api/client';
import { StorePage } from './StorePage';

let authState: 'anonymous' | 'authenticated' = 'anonymous';

vi.mock('../auth/auth-context', () => ({
  useAuth: () => ({
    authState
  })
}));

describe('StorePage', () => {
  test('blocks checkout for anonymous users', async () => {
    authState = 'anonymous';
    const user = userEvent.setup();
    const postSpy = vi.spyOn(apiModule.apiClient, 'post');

    render(<StorePage />);
    await user.click(screen.getByRole('button', { name: /buy now/i }));

    expect(screen.getByText(/login is required before starting checkout/i)).toBeInTheDocument();
    expect(postSpy).not.toHaveBeenCalled();
  });

  test('creates a checkout session for authenticated users', async () => {
    authState = 'authenticated';
    const user = userEvent.setup();
    vi.spyOn(apiModule.apiClient, 'post').mockResolvedValue({
      checkoutUrl: 'https://checkout.stripe.test/session/mock'
    });

    render(<StorePage />);
    await user.click(screen.getByRole('button', { name: /buy now/i }));

    expect(await screen.findByText(/checkout session created/i)).toBeInTheDocument();
  });
});
