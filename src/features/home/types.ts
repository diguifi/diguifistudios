export interface GamePageDetails {
  promoImgs: string[];
  detailedDescription: string;
  trailer: string;
  path: string;
  keywords?: string[];
}

export interface GameEntry {
  id: string;
  title: string;
  tagline: string;
  description: string;
  releaseYear: number;
  tags: string[];
  status: 'featured' | 'released' | 'jam' | 'prototype' | 'tool';
  platformLabel: string;
  itchUrl: string;
  inStore?: boolean;
  img?: string;
  cover?: string;
  screenshots?: string[];
  highlight?: boolean;
  pageDetails: GamePageDetails;
}
