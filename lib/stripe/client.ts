import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const instance = getStripeInstance();
    const value = instance[prop as keyof Stripe];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export const PRIVATE_TRANSFER_PRICE = 2500;
export const NON_PLAYER_PRICE = 300;

export const PRIVATE_TRANSFER_STRIPE = {
  productId: 'prod_U0XuGyQmacBoe8',
  priceId: 'price_1T2WpIKdGFJYbCXkRr7obLLK',
};

export const NON_PLAYER_STRIPE = {
  productId: 'prod_U0XuSILhjyC807',
  priceId: 'price_1T2WpJKdGFJYbCXkqNOfPPjy',
};
