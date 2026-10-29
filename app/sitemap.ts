import { MetadataRoute } from 'next';
import { siteConfig, getLanguageAlternates } from '@/lib/seo/config';
import { packages } from '@/lib/data/packages';
import { getPublishedPosts } from '@/lib/blog/posts';
import { routing } from '@/i18n/routing';


export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const locales = routing.locales;
  const defaultLocale = routing.defaultLocale;

  const staticRoutes = [
    { path: '', priority: 1, changeFrequency: 'daily' as const },
    { path: '/booking', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/packages', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/packages/combined', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/special-packages', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/menu', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/seats', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'daily' as const },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/safety', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/refund', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  const staticPages: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    for (const locale of locales) {
      if (route.path === '/blog' && locale !== defaultLocale) continue;
      const localePath = locale === defaultLocale ? route.path : `/${locale}${route.path}`;
      staticPages.push({
        url: `${baseUrl}${localePath}`,
        alternates: route.path === '/blog' ? undefined : { languages: getLanguageAlternates(route.path) },
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  const packagePages: MetadataRoute.Sitemap = [];
  const publishedPackages = packages.filter(pkg => pkg.slug && pkg.category !== 'transfer' && !pkg.suspended);

  for (const pkg of publishedPackages) {
    for (const locale of locales) {
      const localePath = locale === defaultLocale 
        ? `/packages/${pkg.slug}` 
        : `/${locale}/packages/${pkg.slug}`;
      packagePages.push({
        url: `${baseUrl}${localePath}`,
        alternates: { languages: getLanguageAlternates(`/packages/${pkg.slug}`) },
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  }

  const blogPages: MetadataRoute.Sitemap = (await getPublishedPosts()).map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at || post.published_at,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  return [...staticPages, ...packagePages, ...blogPages];
}
