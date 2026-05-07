export interface Order {
  id: string;
  productName: string;
  productCategory: 'bundle' | 'service' | 'subscription' | 'donation';
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
}
