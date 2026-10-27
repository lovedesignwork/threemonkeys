import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo/config';
const url = `${siteConfig.url}/blog`;
export const metadata: Metadata = {
  title: 'Restaurant Stories & Phuket Dining',
  description: 'Plan your visit to Three Monkeys Phuket with guides to jungle dining, special seats, Thai food and celebrations.',
  alternates: { canonical: url, languages: { en: url, 'x-default': url } },
  openGraph: { url, locale: 'en_US', type: 'website' },
};
export default function PageLayout({ children }: { children: React.ReactNode }) { return children; }
