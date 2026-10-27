import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import type { PublicPost } from "@/lib/blog/types";
import { BlogImage } from "./BlogImage";
export function PostCard({
  post,
  priority = false,
}: {
  post: PublicPost;
  priority?: boolean;
}) {
  const media = post.image_manifest.find((m) => m.src === post.featured_image);
  return (
    <article className="group border-b border-white/15 pb-7">
      <Link
        href={`/blog/${post.slug}`}
        className="block overflow-hidden rounded-sm"
      >
        {media && <BlogImage media={media} card featured={priority} />}
      </Link>
      <p className="mb-3 mt-6 text-xs uppercase tracking-[.2em] text-[#b1b94c]">
        {post.category}
      </p>
      <h3 className="font-[family-name:var(--font-krona)] text-lg leading-relaxed normal-case text-white">
        <Link href={`/blog/${post.slug}`} className="hover:text-[#b1b94c]">
          {post.title}
        </Link>
      </h3>
      <p className="mt-4 text-base leading-relaxed text-white/65">
        {post.excerpt}
      </p>
      <Link
        href={`/blog/${post.slug}`}
        className="mt-5 inline-flex items-center gap-2 text-sm text-[#b1b94c]"
      >
        Read the story <ArrowUpRight size={17} />
      </Link>
    </article>
  );
}
