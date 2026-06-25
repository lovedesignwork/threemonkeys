import { ImageResponse } from 'next/og';
import { getBlogPostBySlug, blogPosts } from '@/lib/data/blog';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'edge';
export const alt = 'Three Monkeys Restaurant Blog';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getBlogPost(slug: string) {
  try {
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .select('title, excerpt, category')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!error && post) {
      return post;
    }
  } catch {
    // Fall through to static
  }

  const staticPost = getBlogPostBySlug(slug);
  if (staticPost) {
    return {
      title: staticPost.title,
      excerpt: staticPost.excerpt,
      category: staticPost.category,
    };
  }

  return null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  const title = post?.title || 'Three Monkeys Blog';
  const category = post?.category || 'Blog';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 80%, rgba(177, 185, 76, 0.2) 0%, transparent 50%)',
            display: 'flex',
          }}
        />
        
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            padding: 60,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: '#b1b94c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}
            >
              🐒
            </div>
            <span
              style={{
                color: '#b1b94c',
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.1em',
              }}
            >
              THREE MONKEYS BLOG
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              maxWidth: '85%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#b1b94c',
                  color: '#000',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 100,
                }}
              >
                {category}
              </span>
            </div>
            <h1
              style={{
                fontSize: title.length > 60 ? 48 : 56,
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {title}
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: 18,
              }}
            >
              threemonkeys.vercel.app/blog
            </span>
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 16,
              }}
            >
              Authentic Thai Cuisine in Phuket
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
