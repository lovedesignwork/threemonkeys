import { cleanArticle, articleImageSources, wordCount } from "./html";
import type { BlogMedia } from "./types";

export function validatePost(
  input: Record<string, unknown>,
  registry: BlogMedia[],
) {
  const text = (key: string) =>
    typeof input[key] === "string" ? (input[key] as string).trim() : "";
  const content = cleanArticle(text("content"));
  const slug = text("slug");
  const status = input.status === "published" ? "published" : "draft";
  const featured_image = text("featured_image");
  const sources = [featured_image, ...articleImageSources(content)].filter(
    Boolean,
  );
  const images = sources
    .map((src) => registry.find((m) => m.src === src))
    .filter((m): m is BlogMedia => !!m);
  if (!text("title") || !slug) throw new Error("Add a title and URL slug.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error("Use lowercase words separated by hyphens for the slug.");
  if (new Set(sources).size !== sources.length)
    throw new Error(
      "Each article image must be different, including the featured image.",
    );
  if (images.length !== sources.length)
    throw new Error(
      "Upload or select every image from the blog photo library.",
    );
  if (status === "published") {
    const words = wordCount(content);
    if (words < 800 || words > 1600)
      throw new Error(
        `Article body has ${words} words. Publish with 800–1,600 words.`,
      );
    if (!featured_image || images.length < 3 || images.length > 5)
      throw new Error(
        "Choose one featured image and 2–4 different supporting images.",
      );
    if (images.some((m) => !m.alt || !m.caption))
      throw new Error("Every photo needs descriptive alt text and a caption.");
    if (!text("seo_title") || !text("seo_description") || !text("excerpt"))
      throw new Error("Add an introduction, SEO title and meta description.");
    if (!/<h2[ >]/i.test(content))
      throw new Error(
        "Add section headings (H2) so readers can navigate the article.",
      );
  }
  return {
    title: text("title"),
    slug,
    excerpt: text("excerpt"),
    content,
    category: text("category") || "Guide",
    featured_image,
    seo_title: text("seo_title"),
    seo_description: text("seo_description"),
    focus_keyword: text("focus_keyword"),
    tags: Array.isArray(input.tags)
      ? input.tags.filter((v): v is string => typeof v === "string")
      : [],
    status,
    author: "Three Monkeys Restaurant",
    image_manifest: images,
  };
}
