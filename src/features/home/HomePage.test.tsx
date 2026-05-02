import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  test('renders the catalog and opens a game details panel', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Tiny Land/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /read more/i }).at(0)!);

    const detailsPanel = screen.getByLabelText(/we're just old kids details/i);

    expect(within(detailsPanel).getByRole('heading', { name: /we're just old kids/i })).toBeInTheDocument();
    expect(within(detailsPanel).getByRole('link', { name: /open on itch.io/i })).toHaveAttribute(
      'href',
      'https://diguifi.itch.io/were-just-old-kids'
    );
  });

  test('scrolls to the catalog when the explore button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /explore games/i }));

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
