export interface GameEntry {
  id: string;
  title: string;
  tagline: string;
  description: string;
  releaseYear: number;
  tags: string[];
  status: 'featured' | 'released' | 'jam' | 'prototype';
  platformLabel: string;
  itchUrl: string;
  img?: string;
  cover?: string;
  screenshots?: string[];
  highlight?: boolean;
}
