import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  test('renders a friendly 404 message and recovery links', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to portfolio/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /open store/i })).toHaveAttribute('href', '/store');
  });
});
