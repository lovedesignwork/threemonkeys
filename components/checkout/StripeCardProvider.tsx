'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Appearance } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeCardProviderProps {
  children: ReactNode;
}

export default function StripeCardProvider({ children }: StripeCardProviderProps) {
  const appearance: Appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#1a237e',
      colorBackground: '#f8fafc',
      colorText: '#1e293b',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
    rules: {
      '.Input': {
        border: '1px solid #e2e8f0',
        boxShadow: 'none',
        padding: '12px 14px',
      },
      '.Input:focus': {
        border: '1px solid #1a237e',
        boxShadow: '0 0 0 1px #1a237e',
      },
      '.Label': {
        fontWeight: '500',
        fontSize: '14px',
        marginBottom: '6px',
      },
      '.Error': {
        fontSize: '12px',
        marginTop: '4px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={{ appearance }}>
      {children}
    </Elements>
  );
}
