import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as apiModule from '../../shared/api/client';
import { AdminProductsPage } from './AdminProductsPage';
import type { AdminProduct } from './types';

const mockUseAuth = vi.fn();

vi.mock('../auth/auth-context', () => ({
  useAuth: () => mockUseAuth()
}));

const products: AdminProduct[] = [
  {
    id: 'prod-1',
    slug: 'supporter-pack',
    name: 'Supporter Pack',
    description: 'Support us',
    price: 10,
    currency: 'BRL',
    category: 'bundle',
    isActive: true
  },
  {
    id: 'prod-2',
    slug: 'service-pack',
    name: 'Service Pack',
    description: 'A service',
    price: 50,
    currency: 'BRL',
    category: 'service',
    isActive: true
  }
];

function adminAuthState() {
  return {
    authState: 'authenticated',
    user: { id: 'u1', email: 'admin@example.com', name: 'Admin', isAdmin: true }
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminProductsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('confirm', vi.fn(() => true));
  vi.stubGlobal('alert', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AdminProductsPage', () => {
  it('returns null while auth is pending', () => {
    mockUseAuth.mockReturnValue({ authState: 'refreshing', user: null });
    const { container } = renderPage();
    expect(container).toBeEmptyDOMElement();
  });

  it('returns null while authenticating', () => {
    mockUseAuth.mockReturnValue({ authState: 'authenticating', user: null });
    const { container } = renderPage();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows NotFoundPage when user is not admin', async () => {
    mockUseAuth.mockReturnValue({
      authState: 'authenticated',
      user: { id: 'u1', email: 'user@example.com', name: 'User', isAdmin: false }
    });
    renderPage();
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument();
  });

  it('shows loading state for admin user', () => {
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders product list for admin', async () => {
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(products);
    renderPage();
    expect(await screen.findByText('Supporter Pack')).toBeInTheDocument();
    expect(screen.getByText('Service Pack')).toBeInTheDocument();
    expect(screen.getByText('supporter-pack')).toBeInTheDocument();
  });

  it('shows empty state when no products', async () => {
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('No products yet.')).toBeInTheDocument();
  });

  it('deletes product after confirm', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(products);
    vi.spyOn(apiModule.apiClient, 'delete').mockResolvedValue(undefined);
    renderPage();
    await screen.findByText('Supporter Pack');
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText('Supporter Pack')).not.toBeInTheDocument();
    });
  });

  it('does not delete when confirm is cancelled', async () => {
    const user = userEvent.setup();
    vi.mocked(confirm).mockReturnValue(false);
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(products);
    const deleteSpy = vi.spyOn(apiModule.apiClient, 'delete');
    renderPage();
    await screen.findByText('Supporter Pack');
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Supporter Pack')).toBeInTheDocument();
  });

  it('shows alert when delete fails with ApiError', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(products);
    vi.spyOn(apiModule.apiClient, 'delete').mockRejectedValue(
      new apiModule.ApiError(400, 'Product has orders')
    );
    renderPage();
    await screen.findByText('Supporter Pack');
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);
    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Product has orders');
    });
  });

  it('shows generic alert when delete fails with non-ApiError', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(products);
    vi.spyOn(apiModule.apiClient, 'delete').mockRejectedValue(new Error('Network error'));
    renderPage();
    await screen.findByText('Supporter Pack');
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);
    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Erro ao excluir produto.');
    });
  });
});
