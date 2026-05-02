import gamesSource from '../../data/games.json';
import type { GameEntry } from './types';

export function loadGamesCatalog(): GameEntry[] {
  const catalog = gamesSource as GameEntry[];

  return catalog.map((entry) => ({
    ...entry,
    screenshots: entry.screenshots ?? [],
    cover: entry.cover ?? undefined,
    highlight: entry.highlight ?? false
  }));
}
