import { getPublishedPosts } from "@/lib/blog/posts";
import { PostCard } from "@/components/blog/PostCard";
import { Link } from "@/i18n/navigation";
export const dynamic = "force-dynamic";
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const posts = await getPublishedPosts();
  const { category } = await searchParams;
  const categories = [...new Set(posts.map((p) => p.category))];
  const filtered = category
    ? posts.filter((p) => p.category === category)
    : posts;
  return (
    <main
      lang="en"
      dir="ltr"
      className="min-h-screen bg-[#121511] px-5 pb-24 pt-40 text-white sm:px-8 sm:pt-48"
    >
      <div className="mx-auto max-w-7xl">
        <p className="mb-5 text-xs uppercase tracking-[.28em] text-[#b1b94c]">
          Three Monkeys journal
        </p>
        <h1 className="max-w-4xl font-[family-name:var(--font-krona)] text-4xl leading-tight normal-case md:text-6xl">
          A little closer
          <br />
          to the rainforest.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/65">
          Good food, memorable tables and thoughtful plans. Explore our guides
          to dining at Three Monkeys Phuket.
        </p>
        <nav
          aria-label="Article categories"
          className="my-12 flex flex-wrap gap-3 border-y border-white/15 py-6"
        >
          {[null, ...categories].map((c) => (
            <Link
              key={c || "all"}
              href={c ? `/blog?category=${encodeURIComponent(c)}` : "/blog"}
              aria-current={
                category === c || (!category && !c) ? "page" : undefined
              }
              className={`rounded-full border px-4 py-2 text-sm ${category === c || (!category && !c) ? "border-[#b1b94c] bg-[#b1b94c] text-black" : "border-white/25 text-white/75 hover:border-[#b1b94c]"}`}
            >
              {c || "All stories"}
            </Link>
          ))}
        </nav>
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <PostCard key={post.id} post={post} priority={i === 0} />
          ))}
        </div>
        {!filtered.length && <p>No published stories in this category yet.</p>}
      </div>
    </main>
  );
}
