import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo/config';
import { packages } from '@/lib/data/packages';
import { blogPosts } from '@/lib/data/blog';
import { routing } from '@/i18n/routing';
import { supabaseAdmin } from '@/lib/supabase/server';

async function getBlogPostsFromSupabase() {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('status', 'published');

    if (error || !posts) return [];
    return posts;
  } catch {
    return [];
  }
}

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
      const localePath = locale === defaultLocale ? route.path : `/${locale}${route.path}`;
      staticPages.push({
        url: `${baseUrl}${localePath}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  const packagePages: MetadataRoute.Sitemap = [];
  const publishedPackages = packages.filter(pkg => pkg.slug && pkg.category !== 'transfer');

  for (const pkg of publishedPackages) {
    for (const locale of locales) {
      const localePath = locale === defaultLocale 
        ? `/packages/${pkg.slug}` 
        : `/${locale}/packages/${pkg.slug}`;
      packagePages.push({
        url: `${baseUrl}${localePath}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  }

  const blogPages: MetadataRoute.Sitemap = [];
  
  const supabasePosts = await getBlogPostsFromSupabase();
  
  const allBlogSlugs = new Set<string>();
  
  for (const post of supabasePosts) {
    allBlogSlugs.add(post.slug);
  }
  
  for (const post of blogPosts) {
    allBlogSlugs.add(post.slug);
  }

  for (const slug of allBlogSlugs) {
    const supabasePost = supabasePosts.find(p => p.slug === slug);
    const staticPost = blogPosts.find(p => p.slug === slug);
    
    const lastModified = supabasePost?.updated_at 
      ? new Date(supabasePost.updated_at) 
      : staticPost?.publishedAt 
        ? new Date(staticPost.publishedAt)
        : new Date();

    for (const locale of locales) {
      const localePath = locale === defaultLocale 
        ? `/blog/${slug}` 
        : `/${locale}/blog/${slug}`;
      blogPages.push({
        url: `${baseUrl}${localePath}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    }
  }

  return [...staticPages, ...packagePages, ...blogPages];
}
