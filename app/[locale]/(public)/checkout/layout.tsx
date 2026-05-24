import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';

export const metadata: Metadata = {
  ...generatePageMetadata(
    'Checkout - Complete Your Booking',
    'Complete your Three Monkeys Restaurant booking. Secure payment with Stripe. Your culinary experience awaits!',
    '/checkout'
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
