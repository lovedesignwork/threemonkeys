import { Metadata } from 'next';
import { localizePageMetadata, generatePageMetadata } from '@/lib/seo/config';

const pageMetadata: Metadata = {
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(pageMetadata, locale);
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
