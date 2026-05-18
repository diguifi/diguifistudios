import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { GameDetailsPage } from './GameDetailsPage';

function renderGameDetailsPage(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/games/:slug" element={<GameDetailsPage />} />
        <Route path="/tools/:slug" element={<GameDetailsPage />} />
        <Route path="/" element={<div>Catalog</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('GameDetailsPage', () => {
  test('renders trailer and SEO metadata for a game with trailer', () => {
    renderGameDetailsPage('/games/were-just-old-kids');

    expect(screen.getByRole('heading', { name: /we're just old kids/i })).toBeInTheDocument();
    expect(screen.getByTitle(/we're just old kids trailer/i)).toBeInTheDocument();
    expect(document.head.querySelector('meta[name="keywords"]')?.getAttribute('content')).toContain(
      'reflective'
    );
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'http://localhost:3000/games/were-just-old-kids'
    );
  });

  test('renders the primary image when no trailer is available', () => {
    renderGameDetailsPage('/tools/tiny-rpg-studio');

    expect(screen.getByRole('img', { name: /cover art for tiny rpg studio/i })).toBeInTheDocument();
    expect(screen.queryByTitle(/trailer/i)).not.toBeInTheDocument();
  });

  test('shows empty gallery state when there are no promo images', () => {
    renderGameDetailsPage('/tools/open-video-game-data');

    expect(screen.getByText(/more promotional images will be added here/i)).toBeInTheDocument();
  });

  test('lets the user browse promo images in the carousel', async () => {
    const user = userEvent.setup();

    renderGameDetailsPage('/games/were-just-old-kids');

    await user.click(screen.getByRole('button', { name: /next promo image/i }));
    expect(screen.getByRole('img', { name: /promo image 2/i })).toBeInTheDocument();
  });

  test('shows buy action for store-backed items without itch url', () => {
    renderGameDetailsPage('/tools/game-notion');

    expect(screen.getByRole('link', { name: /buy/i })).toHaveAttribute('href', '/store');
    expect(screen.queryByRole('link', { name: /open on itch.io/i })).not.toBeInTheDocument();
  });

  test('normalizes local cover image paths on nested routes', () => {
    renderGameDetailsPage('/tools/game-notion');

    expect(screen.getByRole('img', { name: /cover art for game notion - cs2 webradar/i })).toHaveAttribute(
      'src',
      '/imgs/radarCover.jpeg'
    );
  });

  test('opens zoom overlay when clicking the carousel image', async () => {
    const user = userEvent.setup();

    renderGameDetailsPage('/games/were-just-old-kids');

    await user.click(screen.getByRole('button', { name: /zoom promo image/i }));

    expect(screen.getByRole('dialog', { name: /we're just old kids promo image zoom/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /promo image 1 zoomed/i })).toBeInTheDocument();
  });

  test('closes zoom overlay with the close button', async () => {
    const user = userEvent.setup();

    renderGameDetailsPage('/games/were-just-old-kids');

    await user.click(screen.getByRole('button', { name: /zoom promo image/i }));
    await user.click(screen.getByRole('button', { name: /close zoomed image/i }));

    expect(screen.queryByRole('dialog', { name: /promo image zoom/i })).not.toBeInTheDocument();
  });
});
