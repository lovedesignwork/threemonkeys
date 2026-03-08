import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, User, Tag, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/lib/seo/config';
import { ArticleSchema, BreadcrumbSchema } from '@/lib/seo/structured-data';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getBlogPostBySlug, blogPosts } from '@/lib/data/blog';
import { marked } from 'marked';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

async function getBlogPost(slug: string) {
  // First try Supabase
  try {
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        *,
        author:admin_users!author_id(name)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!error && post) {
      return {
        ...post,
        authorName: post.author?.name || 'Three Monkeys Team',
        readTime: Math.ceil((post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0) / 200) || 5,
        source: 'supabase',
      };
    }
  } catch (e) {
    // Supabase failed, continue to static data
  }

  // Fallback to static data
  const staticPost = getBlogPostBySlug(slug);
  if (staticPost) {
    return {
      ...staticPost,
      featured_image: staticPost.image,
      published_at: staticPost.publishedAt,
      authorName: staticPost.author,
      source: 'static',
    };
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  const url = `${siteConfig.url}/blog/${slug}`;
  const image = post.og_image || post.featured_image || siteConfig.ogImage;

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    authors: [{ name: post.authorName }],
    alternates: {
      canonical: post.canonical_url || url,
    },
    openGraph: {
      type: 'article',
      title: post.og_title || post.seo_title || `${post.title} | ${siteConfig.name}`,
      description: post.og_description || post.seo_description || post.excerpt,
      url,
      images: [
        {
          url: image.startsWith('http') ? image : `${siteConfig.url}${image}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.published_at,
      authors: [post.authorName],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const articleUrl = `${siteConfig.url}/blog/${slug}`;
  const articleImage = post.featured_image?.startsWith('http') 
    ? post.featured_image 
    : post.featured_image 
      ? `${siteConfig.url}${post.featured_image}` 
      : `${siteConfig.url}${siteConfig.ogImage}`;

  // Convert markdown to HTML for static posts
  const contentHtml = post.source === 'static' 
    ? await marked(post.content || '')
    : post.content || '';

  // Get related posts (other posts from same category or random)
  const relatedPosts = blogPosts
    .filter(p => p.slug !== slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <ArticleSchema
        title={post.title}
        description={post.seo_description || post.excerpt || ''}
        image={articleImage}
        url={articleUrl}
        datePublished={post.published_at}
        author={post.authorName}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: siteConfig.url },
          { name: 'Blog', url: `${siteConfig.url}/blog` },
          { name: post.title, url: articleUrl },
        ]}
      />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        {post.featured_image && (
          <>
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          </>
        )}
        
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-[#b1b94c] mb-8 transition-colors font-[family-name:var(--font-inter)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          
          {post.category && (
            <span className="inline-block px-4 py-1.5 bg-[#b1b94c] text-black text-sm font-semibold rounded-full mb-6">
              {post.category}
            </span>
          )}
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-[family-name:var(--font-krona)] text-white mb-8 leading-tight normal-case">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-white/60 font-[family-name:var(--font-inter)]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {post.authorName}
            </div>
            {post.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at)}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readTime} min read
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Article Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            <div 
              className="text-white/70 leading-relaxed font-[family-name:var(--font-inter)]
                [&_h1]:text-white [&_h1]:text-3xl [&_h1]:font-[family-name:var(--font-krona)] [&_h1]:mt-12 [&_h1]:mb-6 [&_h1]:normal-case
                [&_h2]:text-white [&_h2]:text-2xl [&_h2]:font-[family-name:var(--font-krona)] [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:normal-case
                [&_h3]:text-white [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-4 
                [&_p]:mb-6 [&_p]:text-lg
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2
                [&_li]:text-white/70
                [&_a]:text-[#b1b94c] [&_a]:underline [&_a]:hover:text-[#d4c91e]
                [&_blockquote]:border-l-4 [&_blockquote]:border-[#b1b94c] [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:my-8 [&_blockquote]:text-white/60
                [&_img]:rounded-2xl [&_img]:my-8 [&_img]:border [&_img]:border-white/10
                [&_strong]:text-white [&_strong]:font-semibold
                [&_code]:bg-white/10 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-[#b1b94c]
                [&_pre]:bg-[#111] [&_pre]:p-6 [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-white/10 [&_pre]:overflow-x-auto
                [&_hr]:border-white/10 [&_hr]:my-12"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </article>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h4 className="text-white/40 text-sm uppercase tracking-widest mb-4 font-[family-name:var(--font-inter)]">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span 
                    key={tag} 
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-[#b1b94c] hover:border-[#b1b94c]/30 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-20 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white mb-10 normal-case">
            More Articles
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group block">
                <article className="h-full bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 hover:border-[#b1b94c]/30 transition-all">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-[#b1b94c] text-black text-xs font-semibold rounded-full">
                        {relatedPost.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-[family-name:var(--font-krona)] text-white mb-2 group-hover:text-[#b1b94c] transition-colors normal-case line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-white/50 text-sm line-clamp-2 font-[family-name:var(--font-inter)]">
                      {relatedPost.excerpt}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <span className="flex items-center gap-2 text-[#b1b94c] text-sm font-medium group-hover:gap-3 transition-all">
                        Read More
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white mb-4 normal-case">
            Ready to Experience Three Monkeys?
          </h2>
          <p className="text-white/50 mb-8 font-[family-name:var(--font-inter)]">
            Book your table and discover the magic of jungle dining
          </p>
          <Link href="/booking">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all">
              Reserve Your Table
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
