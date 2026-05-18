import gamesSource from '../../data/games.json';
import type { GameEntry } from './types';

function buildDefaultPagePath(entry: Pick<GameEntry, 'id' | 'status'>) {
  const basePath = entry.status === 'tool' ? '/tools' : '/games';
  return `${basePath}/${entry.id}`;
}

function buildFallbackKeywords(entry: Pick<GameEntry, 'title' | 'tags' | 'id'>) {
  return Array.from(
    new Set([
      ...entry.tags,
      entry.title,
      entry.title.toLowerCase(),
      entry.id.replaceAll('-', ' ')
    ])
  );
}

export function loadGamesCatalog(): GameEntry[] {
  const catalog = gamesSource as GameEntry[];

  return catalog.map((entry) => ({
    ...entry,
    screenshots: entry.screenshots ?? [],
    cover: entry.cover ?? entry.img ?? undefined,
    highlight: entry.highlight ?? false,
    pageDetails: {
      promoImgs: entry.pageDetails?.promoImgs ?? [],
      detailedDescription: entry.pageDetails?.detailedDescription ?? entry.description,
      trailer: entry.pageDetails?.trailer ?? '',
      path: entry.pageDetails?.path ?? buildDefaultPagePath(entry),
      keywords: entry.pageDetails?.keywords ?? buildFallbackKeywords(entry)
    }
  }));
}

export function findGameByPagePath(pathname: string): GameEntry | undefined {
  return loadGamesCatalog().find((entry) => entry.pageDetails.path === pathname);
}
