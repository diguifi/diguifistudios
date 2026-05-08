export interface Order {
  id: string;
  productName: string;
  productCategory: 'bundle' | 'service' | 'subscription' | 'donation';
  bundleType: string | null;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  cancelAtPeriodEnd: boolean;
}
