import { getPublishedPosts } from "@/lib/blog/posts";
import { PostCard } from "@/components/blog/PostCard";
import { Link } from "@/i18n/navigation";
export async function LatestArticles() {
  const posts = (await getPublishedPosts()).slice(0, 3);
  if (!posts.length) return null;
  return (
    <section
      lang="en"
      dir="ltr"
      className="bg-[#121511] px-5 py-20 sm:px-8 lg:py-28"
      aria-labelledby="latest-stories"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[.25em] text-[#b1b94c]">
              From the rainforest
            </p>
            <h2
              id="latest-stories"
              className="font-[family-name:var(--font-krona)] text-3xl leading-tight text-white normal-case md:text-4xl"
            >
              Stories for your next visit
            </h2>
          </div>
          <Link
            href="/blog"
            className="border-b border-[#b1b94c] pb-2 text-sm text-[#b1b94c]"
          >
            Explore the blog ↗
          </Link>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
