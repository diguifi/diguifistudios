import { useState } from 'react';
import { normalizeMediaPath } from './media';
import type { GameEntry } from './types';

export function GameCover({ game }: { game: GameEntry }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = normalizeMediaPath(game.cover ?? game.img);

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
