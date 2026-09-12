import { Metadata } from 'next';
import { localizePageMetadata, generatePageMetadata } from '@/lib/seo/config';

const pageMetadata: Metadata = generatePageMetadata(
  'Book Your Table - Online Reservation',
  'Book your dining experience at Three Monkeys Restaurant Phuket online. Select your package, date, time, and add extras. Secure online payment and optional private hotel transfers.',
  '/booking'
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizePageMetadata(pageMetadata, locale);
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
