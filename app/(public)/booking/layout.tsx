import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';

export const metadata: Metadata = generatePageMetadata(
  'Book Your Table - Online Reservation',
  'Book your dining experience at Three Monkeys Restaurant Phuket online. Select your package, date, time, and add extras. Instant confirmation and free hotel pickup included.',
  '/booking'
);

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
