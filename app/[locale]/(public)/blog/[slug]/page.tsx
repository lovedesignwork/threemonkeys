import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/seo/config";
import { ArticleSchema, BreadcrumbSchema } from "@/lib/seo/structured-data";
import {
  getPublishedPost,
  getPublishedPosts,
  relatedPosts,
} from "@/lib/blog/posts";
import { prepareArticle } from "@/lib/blog/html";
import { BlogImage } from "@/components/blog/BlogImage";
import { PostCard } from "@/components/blog/PostCard";
import "./article.css";
interface Props {
  params: Promise<{ slug: string; locale: string }>;
}
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const url = `${siteConfig.url}/blog/${slug}`;
  const media = post.image_manifest.find((m) => m.src === post.featured_image);
  const image = {
    url: new URL(post.featured_image, siteConfig.url).href,
    width: media?.width,
    height: media?.height,
    alt: media?.alt || post.title,
  };
  return {
    title: { absolute: post.seo_title },
    description: post.seo_description,
    alternates: { canonical: url, languages: { en: url, "x-default": url } },
    openGraph: {
      type: "article",
      locale: "en_US",
      url,
      title: post.seo_title,
      description: post.seo_description,
      images: [image],
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_title,
      description: post.seo_description,
      images: [image],
    },
  };
}
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const url = `${siteConfig.url}/blog/${slug}`;
  const media = post.image_manifest.find((m) => m.src === post.featured_image);
  const content = prepareArticle(post.content, post.image_manifest);
  const related = relatedPosts(post, await getPublishedPosts());
  return (
    <main
      className="blog-reading min-h-screen bg-[#f6f4ec] text-[#252d24]"
      lang="en"
      dir="ltr"
    >
      <ArticleSchema
        title={post.title}
        description={post.seo_description}
        image={new URL(post.featured_image, siteConfig.url).href}
        url={url}
        publishedAt={post.published_at}
        updatedAt={post.updated_at}
        author={post.author}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Blog", url: `${siteConfig.url}/blog` },
          { name: post.title, url },
        ]}
      />
      <header className="bg-[#121511] px-5 pb-12 pt-40 text-white sm:px-8 sm:pb-16 sm:pt-48">
        <div className="mx-auto max-w-[1000px]">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex gap-3 text-sm text-white/65"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
          </nav>
          <p className="mb-5 text-xs uppercase tracking-[.22em] text-[#b1b94c]">
            {post.category}
          </p>
          <h1 className="font-[family-name:var(--font-krona)] text-[clamp(1.8rem,4vw,3.2rem)] leading-[1.3] normal-case">
            {post.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75">
            {post.excerpt}
          </p>
          <p className="mt-6 text-sm text-white/55">
            By {post.author || "Three Monkeys Team"}
          </p>
        </div>
      </header>
      {media && (
        <figure className="mx-auto max-w-[1152px] px-5 pt-10 sm:px-8">
          <BlogImage media={media} featured />
          <figcaption className="mt-3 text-center text-sm leading-relaxed text-[#5b6658]">
            {media.caption}
          </figcaption>
        </figure>
      )}
      <div className="mx-auto max-w-[784px] px-5 pb-20 pt-10 sm:px-8">
        <details className="article-toc mb-12 rounded-sm border border-[#cbd0bd] bg-[#eeeee3] px-6 py-5">
          <summary className="cursor-pointer font-semibold">
            In this article
          </summary>
          <nav aria-label="Table of contents">
            <ol className="mt-4 space-y-3">
              {content.toc.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className="underline decoration-[#acb58b] underline-offset-4"
                  >
                    {h.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </details>
        <article
          className="article-body"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
        <aside className="mt-14 border-t border-[#cbd0bd] pt-8">
          <p className="text-xl font-semibold">Make it your kind of visit.</p>
          <p className="mt-3 leading-relaxed">
            Explore the seats and check availability for your table in the
            rainforest.
          </p>
          <Link
            href="/booking"
            className="mt-6 inline-block rounded-full bg-[#303d22] px-7 py-4 font-semibold text-white hover:bg-[#45592d]"
          >
            Reserve your table ↗
          </Link>
        </aside>
      </div>
      <section className="bg-[#121511] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 font-[family-name:var(--font-krona)] text-2xl normal-case">
            Keep exploring
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
