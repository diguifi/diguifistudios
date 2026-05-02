export interface Product {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  category: 'game' | 'service' | 'bundle';
}

export interface CheckoutSessionRequest {
  productId: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}
