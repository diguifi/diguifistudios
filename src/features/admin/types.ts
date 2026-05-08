export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  stripeProductId?: string;
  stripePriceId?: string;
  isActive: boolean;
}

export interface ProductFormData {
  slug: string;
  name: string;
  description: string;
  category: number;
  price: number;
  currency: string;
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
}

export const PRODUCT_CATEGORIES = [
  { label: 'Bundle', value: 0, key: 'bundle' },
  { label: 'Service', value: 1, key: 'service' },
  { label: 'Subscription', value: 2, key: 'subscription' },
  { label: 'Donation', value: 3, key: 'donation' }
] as const;

export interface AdminBundle {
  productId: string;
  productName: string;
  driveUrl: string;
  fileName: string;
  updatedAt: string;
}

export interface BundleFormData {
  productId: string;
  driveUrl: string;
  fileName: string;
}

export interface AdminGameNotionPlayer {
  playerId: string;
  lastPing: string;
}

export interface GameNotionPlayerFormData {
  playerId: string;
  lastPing: string;
}
