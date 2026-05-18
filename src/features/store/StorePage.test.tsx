import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as apiModule from '../../shared/api/client';
import * as navigationModule from '../../shared/navigation';
import { StorePage } from './StorePage';
import type { Product } from './types';

const mockProducts: Product[] = [
  {
    id: 'supporter-pack',
    slug: '/tools/game-notion',
    name: 'Diguifi Supporter Pack',
    description: 'Support my work with a small monthly donation.',
    price: 10,
    currency: 'BRL',
    category: 'bundle',
    isActive: true,
    isPurchased: false
  }
];

const mockProductsWithoutSlug: Product[] = [
  {
    id: 'plain-pack',
    slug: '',
    name: 'Plain Product',
    description: 'No slug attached.',
    price: 5,
    currency: 'BRL',
    category: 'bundle',
    isActive: true,
    isPurchased: false
  }
];

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

let authState: 'anonymous' | 'authenticated' = 'anonymous';

vi.mock('../auth/auth-context', () => ({
  useAuth: () => ({ authState })
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StorePage', () => {
  test('redirects anonymous users to login when clicking Buy', async () => {
    authState = 'anonymous';
    const user = userEvent.setup();
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(mockProducts);
    const postSpy = vi.spyOn(apiModule.apiClient, 'post');

    render(
      <MemoryRouter>
        <StorePage />
      </MemoryRouter>
    );
    await screen.findByRole('button', { name: /buy now/i });
    await user.click(screen.getByRole('button', { name: /buy now/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/login?next=%2Fstore');
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

    render(
      <MemoryRouter>
        <StorePage />
      </MemoryRouter>
    );
    await screen.findByRole('button', { name: /buy now/i });
    await user.click(screen.getByRole('button', { name: /buy now/i }));

    expect(redirectSpy).toHaveBeenCalledWith('https://checkout.stripe.test/session/mock');
  });

  test('renders product title as link when slug is provided', async () => {
    authState = 'anonymous';
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(mockProducts);

    render(
      <MemoryRouter>
        <StorePage />
      </MemoryRouter>
    );

    expect(await screen.findByRole('link', { name: /diguifi supporter pack/i })).toHaveAttribute(
      'href',
      '/tools/game-notion'
    );
  });

  test('renders plain title when slug is empty', async () => {
    authState = 'anonymous';
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(mockProductsWithoutSlug);

    render(
      <MemoryRouter>
        <StorePage />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /plain product/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /plain product/i })).not.toBeInTheDocument();
  });
});
