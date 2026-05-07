import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as apiModule from '../../shared/api/client';
import { AdminProductFormPage } from './AdminProductFormPage';
import type { AdminProduct } from './types';

const mockUseAuth = vi.fn();
const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('../auth/auth-context', () => ({
  useAuth: () => mockUseAuth()
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const existingProduct: AdminProduct = {
  id: 'prod-1',
  slug: 'supporter-pack',
  name: 'Supporter Pack',
  description: 'Support our work',
  price: 10,
  currency: 'BRL',
  category: 'bundle',
  stripeProductId: 'prod_abc',
  stripePriceId: 'price_abc',
  isActive: true
};

function adminAuthState() {
  return {
    authState: 'authenticated',
    user: { id: 'u1', email: 'admin@example.com', name: 'Admin', isAdmin: true }
  };
}

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/admin/products/new']}>
      <Routes>
        <Route path="/admin/products/new" element={<AdminProductFormPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEdit(id = 'prod-1') {
  return render(
    <MemoryRouter initialEntries={[`/admin/products/${id}/edit`]}>
      <Routes>
        <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminProductFormPage', () => {
  it('returns null while auth is pending', () => {
    mockUseAuth.mockReturnValue({ authState: 'refreshing', user: null });
    const { container } = renderCreate();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows NotFoundPage when not admin', async () => {
    mockUseAuth.mockReturnValue({
      authState: 'authenticated',
      user: { id: 'u1', email: 'user@example.com', name: 'User', isAdmin: false }
    });
    renderCreate();
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument();
  });

  it('shows empty create form with Create button', async () => {
    mockUseAuth.mockReturnValue(adminAuthState());
    renderCreate();
    expect(await screen.findByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'New product' })).toBeInTheDocument();
  });

  it('shows loading state for edit mode while fetching', () => {
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockReturnValue(new Promise(() => {}));
    renderEdit();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('populates form with product data in edit mode', async () => {
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(existingProduct);
    renderEdit();
    const nameInput = await screen.findByLabelText('Name');
    expect(nameInput).toHaveValue('Supporter Pack');
    expect(screen.getByLabelText('Slug')).toHaveValue('supporter-pack');
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('shows Edit product heading in edit mode', async () => {
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(existingProduct);
    renderEdit();
    expect(await screen.findByRole('heading', { name: 'Edit product' })).toBeInTheDocument();
  });

  it('submits POST for create and navigates to product list', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'post').mockResolvedValue({});
    renderCreate();

    await screen.findByRole('button', { name: 'Create' });
    await user.type(screen.getByLabelText('Name'), 'New Product');
    await user.type(screen.getByLabelText('Slug'), 'new-product');
    await user.type(screen.getByLabelText('Description'), 'A description');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/products'));
    expect(apiModule.apiClient.post).toHaveBeenCalledWith(
      '/api/produto',
      expect.objectContaining({ name: 'New Product', slug: 'new-product' })
    );
  });

  it('submits PUT for edit and navigates to product list', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'get').mockResolvedValue(existingProduct);
    vi.spyOn(apiModule.apiClient, 'put').mockResolvedValue({});
    renderEdit('prod-1');

    await screen.findByDisplayValue('Supporter Pack');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/products'));
    expect(apiModule.apiClient.put).toHaveBeenCalledWith(
      '/api/produto/prod-1',
      expect.objectContaining({ name: 'Supporter Pack' })
    );
  });

  it('shows ApiError message on submit failure', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'post').mockRejectedValue(
      new apiModule.ApiError(400, 'Slug already exists')
    );
    renderCreate();

    await screen.findByRole('button', { name: 'Create' });
    await user.type(screen.getByLabelText('Name'), 'Dup Product');
    await user.type(screen.getByLabelText('Slug'), 'dup-product');
    await user.type(screen.getByLabelText('Description'), 'Duplicate');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Slug already exists')).toBeInTheDocument();
  });

  it('shows generic error message on non-ApiError failure', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    vi.spyOn(apiModule.apiClient, 'post').mockRejectedValue(new Error('Network error'));
    renderCreate();

    await screen.findByRole('button', { name: 'Create' });
    await user.type(screen.getByLabelText('Name'), 'Product X');
    await user.type(screen.getByLabelText('Slug'), 'product-x');
    await user.type(screen.getByLabelText('Description'), 'Desc');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Erro ao salvar produto.')).toBeInTheDocument();
  });

  it('navigates to products list on Cancel', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    renderCreate();

    await screen.findByRole('button', { name: 'Cancel' });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
  });

  it('updates form field values on change', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    renderCreate();

    const nameInput = await screen.findByLabelText('Name');
    await user.type(nameInput, 'Typed Name');
    expect(nameInput).toHaveValue('Typed Name');

    const priceInput = screen.getByLabelText('Price');
    await user.clear(priceInput);
    await user.type(priceInput, '25.5');
    expect(priceInput).toHaveValue(25.5);
  });

  it('toggles isActive checkbox', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    renderCreate();

    await screen.findByRole('button', { name: 'Create' });
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('sends null for empty stripeProductId and stripePriceId', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue(adminAuthState());
    const postSpy = vi.spyOn(apiModule.apiClient, 'post').mockResolvedValue({});
    renderCreate();

    await screen.findByRole('button', { name: 'Create' });
    await user.type(screen.getByLabelText('Name'), 'Product');
    await user.type(screen.getByLabelText('Slug'), 'product');
    await user.type(screen.getByLabelText('Description'), 'Desc');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/api/produto',
        expect.objectContaining({ stripeProductId: null, stripePriceId: null })
      );
    });
  });
});
