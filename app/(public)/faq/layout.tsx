import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';

export const metadata: Metadata = generatePageMetadata(
  'FAQ - Frequently Asked Questions',
  'Find answers to frequently asked questions about Three Monkeys Restaurant Phuket. Learn about reservations, menu options, dietary requirements, dress code, and more.',
  '/faq'
);

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
