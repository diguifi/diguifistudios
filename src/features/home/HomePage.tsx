import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadGamesCatalog } from './catalog';
import type { GameEntry } from './types';

function GameCover({ game }: { game: GameEntry }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = game.cover ?? game.img;

  if (!imageUrl || hasImageError) {
    return (
      <div className="cover-fallback" aria-hidden="true">
        <span>{game.title.slice(0, 1)}</span>
      </div>
    );
  }

  return (
    <img
      className="game-cover"
      src={imageUrl}
      alt={`Cover art for ${game.title}`}
      loading="lazy"
      onError={() => setHasImageError(true)}
    />
  );
}

function GamePanel({
  game,
  onClose
}: {
  game: GameEntry;
  onClose: () => void;
}) {
  return (
    <aside className="game-panel" aria-label={`${game.title} details`}>
      <button type="button" className="panel-close" onClick={onClose} aria-label="Close details">
        X
      </button>
      <p className="eyebrow">{game.platformLabel}</p>
      <h2>{game.title}</h2>
      <p className="game-tagline">{game.tagline}</p>
      <p className="game-description">{game.description}</p>
      <div className="tag-row">
        {game.tags.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
          </span>
        ))}
      </div>
      <div className="panel-actions">
        <a className="primary-button" href={game.itchUrl} target="_blank" rel="noreferrer">
          Open on itch.io
        </a>
      </div>
    </aside>
  );
}

export function HomePage() {
  const games = useMemo(() => loadGamesCatalog(), []);
  const featuredGame = games.find((game) => game.highlight) ?? games[0];
  const [selectedGame, setSelectedGame] = useState<GameEntry | null>(null);

  const scrollToCatalog = () => {
    document.getElementById('game-grid')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="page-stack">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Games Portfolio</p>
          <h1>Telling stories through interactive experiences.</h1>
          <p className="hero-description">
            Diguifi Studios gathers browser experiments, game jam releases, and ongoing ideas in one
            portfolio designed for discovery, replay, and future commerce.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={scrollToCatalog}>
              Explore games
            </button>
            <Link className="ghost-button" to="/store">
              View storefront
            </Link>
          </div>
        </div>

        {featuredGame ? (
          <div className="feature-card">
            <div className="feature-card-media">
              <GameCover game={featuredGame} />
            </div>
            <div className="feature-card-body">
              <p className="eyebrow">Featured release</p>
              <h2>{featuredGame.title}</h2>
              <p>{featuredGame.tagline}</p>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setSelectedGame(featuredGame)}
              >
                Open details
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="stats-strip" aria-label="Studio summary">
        <div>
          <strong>{games.length}</strong>
          <span>catalog entries</span>
        </div>
        <div>
          <strong>{games.filter((game) => game.status === 'jam').length}</strong>
          <span>jam games</span>
        </div>
        <div>
          <strong>Google OAuth</strong>
          <span>session-ready storefront</span>
        </div>
      </section>

      <section className="catalog-section">
        <div className="section-heading">
          <p className="eyebrow">Game catalog</p>
          <h2>Everything listed on itch, reframed for a portfolio-first experience.</h2>
        </div>

        <div className="catalog-grid" id="game-grid">
          {games.map((game) => (
            <article key={game.id} className="game-card">
              <GameCover game={game} />
              <div className="game-card-body">
                <div className="game-card-header">
                  <p className="game-status">{game.status}</p>
                  <p className="game-year">{game.releaseYear}</p>
                </div>
                <h3>{game.title}</h3>
                <p>{game.tagline}</p>
                <div className="tag-row">
                  {game.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setSelectedGame(game)}
                >
                  Read more
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedGame ? (
        <div className="panel-backdrop" onClick={() => setSelectedGame(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <GamePanel game={selectedGame} onClose={() => setSelectedGame(null)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
