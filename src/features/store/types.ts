export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  isActive: boolean;
  isPurchased: boolean;
}

export interface CheckoutSessionRequest {
  productId: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}
