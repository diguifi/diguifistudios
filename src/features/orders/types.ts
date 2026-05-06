export interface Order {
  id: string;
  productName: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
  amount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
}
