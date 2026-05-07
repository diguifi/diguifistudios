import { describe, expect, it, vi } from 'vitest';

vi.mock('../../data/games.json', () => ({
  default: [
    {
      id: 'game-1',
      title: 'Game One',
      tagline: 'A great game',
      description: 'Description',
      releaseYear: 2023,
      tags: ['puzzle'],
      status: 'released',
      platformLabel: 'Browser',
      itchUrl: 'https://itch.io/game-1',
      img: 'img.png'
    },
    {
      id: 'game-2',
      title: 'Game Two',
      tagline: 'Another game',
      description: 'Description',
      releaseYear: 2024,
      tags: [],
      status: 'featured',
      platformLabel: 'Browser',
      itchUrl: 'https://itch.io/game-2',
      cover: 'cover.png',
      screenshots: ['shot1.png'],
      highlight: true
    }
  ]
}));

import { loadGamesCatalog } from './catalog';

describe('loadGamesCatalog', () => {
  it('returns an array with all entries', () => {
    const catalog = loadGamesCatalog();
    expect(catalog).toHaveLength(2);
  });

  it('fills in empty screenshots array when missing', () => {
    const catalog = loadGamesCatalog();
    expect(catalog[0].screenshots).toEqual([]);
  });

  it('preserves existing screenshots', () => {
    const catalog = loadGamesCatalog();
    expect(catalog[1].screenshots).toEqual(['shot1.png']);
  });

  it('falls back to img when cover is missing', () => {
    const catalog = loadGamesCatalog();
    expect(catalog[0].cover).toBe('img.png');
  });

  it('uses cover when present', () => {
    const catalog = loadGamesCatalog();
    expect(catalog[1].cover).toBe('cover.png');
  });

  it('defaults highlight to false when missing', () => {
    const catalog = loadGamesCatalog();
    expect(catalog[0].highlight).toBe(false);
  });

  it('preserves highlight when true', () => {
    const catalog = loadGamesCatalog();
    expect(catalog[1].highlight).toBe(true);
  });
});
