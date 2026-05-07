import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppLayout } from './AppLayout';

const mockUseAuth = vi.fn();

vi.mock('../features/auth/auth-context', () => ({
  useAuth: () => mockUseAuth()
}));

function renderLayout(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppLayout />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AppLayout', () => {
  it('shows login link when anonymous', () => {
    mockUseAuth.mockReturnValue({ authState: 'anonymous', user: null, logout: vi.fn() });
    renderLayout();
    expect(screen.getByText('Login with Google')).toBeInTheDocument();
  });

  it('shows restoring message when refreshing', () => {
    mockUseAuth.mockReturnValue({ authState: 'refreshing', user: null, logout: vi.fn() });
    renderLayout();
    expect(screen.getByText('Restoring session...')).toBeInTheDocument();
  });

  it('shows restoring message when authenticating', () => {
    mockUseAuth.mockReturnValue({ authState: 'authenticating', user: null, logout: vi.fn() });
    renderLayout();
    expect(screen.getByText('Restoring session...')).toBeInTheDocument();
  });

  it('shows firstName in user menu button when firstName is set', () => {
    mockUseAuth.mockReturnValue({
      authState: 'authenticated',
      user: { firstName: 'Alice', name: 'Alice Smith', email: 'alice@example.com', isAdmin: false },
      logout: vi.fn()
    });
    renderLayout();
    expect(screen.getByRole('button', { name: 'Alice' })).toBeInTheDocument();
  });

  it('falls back to name when firstName is not set', () => {
    mockUseAuth.mockReturnValue({
      authState: 'authenticated',
      user: { name: 'Full Name', email: 'full@example.com', isAdmin: false },
      logout: vi.fn()
    });
    renderLayout();
    expect(screen.getByRole('button', { name: 'Full Name' })).toBeInTheDocument();
  });

  it('opens menu and shows My Orders and Logout on click', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      authState: 'authenticated',
      user: { firstName: 'Bob', name: 'Bob Jones', email: 'bob@example.com', isAdmin: false },
      logout: vi.fn()
    });
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Bob' }));
    expect(screen.getByRole('menuitem', { name: 'My Orders' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument();
  });

  it('shows Admin menu item when isAdmin is true', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      authState: 'authenticated',
      user: { firstName: 'SuperAdmin', name: 'SuperAdmin', email: 'admin@example.com', isAdmin: true },
      logout: vi.fn()
    });
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'SuperAdmin' }));
    expect(screen.getByRole('menuitem', { name: 'Admin' })).toBeInTheDocument();
  });

  it('does not show Admin menu item when isAdmin is false', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      authState: 'authenticated',
      user: { firstName: 'Regular', name: 'Regular User', email: 'user@example.com', isAdmin: false },
      logout: vi.fn()
    });
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Regular' }));
    expect(screen.queryByRole('menuitem', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('calls logout when Logout is clicked', async () => {
    const user = userEvent.setup();
    const logout = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      authState: 'authenticated',
      user: { firstName: 'Carol', name: 'Carol', email: 'carol@example.com', isAdmin: false },
      logout
    });
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Carol' }));
    await user.click(screen.getByRole('menuitem', { name: 'Logout' }));
    expect(logout).toHaveBeenCalled();
  });

  it('closes menu when clicking outside', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      authState: 'authenticated',
      user: { firstName: 'Dave', name: 'Dave', email: 'dave@example.com', isAdmin: false },
      logout: vi.fn()
    });
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Dave' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders Portfolio and Store nav links', () => {
    mockUseAuth.mockReturnValue({ authState: 'anonymous', user: null, logout: vi.fn() });
    renderLayout();
    expect(screen.getByRole('link', { name: 'Portfolio' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Store' })).toBeInTheDocument();
  });

  it('includes next param in login link', () => {
    mockUseAuth.mockReturnValue({ authState: 'anonymous', user: null, logout: vi.fn() });
    renderLayout('/store');
    const loginLink = screen.getByText('Login with Google').closest('a');
    expect(loginLink?.getAttribute('href')).toContain('next=');
  });
});
