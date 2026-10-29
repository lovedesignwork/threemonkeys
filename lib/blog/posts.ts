import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { PublicPost } from "./types";

// Publication dates are factual metadata; future articles remain private below.
const fields =
  "id,slug,title,excerpt,content,category,tags,featured_image,seo_title,seo_description,focus_keyword,image_manifest,author,published_at,updated_at";
export const getPublishedPosts = cache(async (): Promise<PublicPost[]> => {
  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select(fields)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .order("id");
  if (error) throw new Error("Unable to load published stories");
  return (data || []) as PublicPost[];
});
export const getPublishedPost = cache(
  async (slug: string) =>
    (await getPublishedPosts()).find((post) => post.slug === slug) || null,
);
export function relatedPosts(post: PublicPost, all: PublicPost[]) {
  return all
    .filter((p) => p.id !== post.id)
    .sort(
      (a, b) =>
        Number(b.category === post.category) -
          Number(a.category === post.category) ||
        b.tags.filter((t) => post.tags.includes(t)).length -
          a.tags.filter((t) => post.tags.includes(t)).length,
    )
    .slice(0, 3);
}
