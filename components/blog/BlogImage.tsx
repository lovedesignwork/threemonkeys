import type { BlogMedia } from "@/lib/blog/types";

export function BlogImage({
  media,
  featured = false,
  card = false,
}: {
  media: BlogMedia;
  featured?: boolean;
  card?: boolean;
}) {
  return (
    <img
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      srcSet={media.variants.map((v) => `${v.src} ${v.width}w`).join(", ")}
      sizes={
        card
          ? "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 390px"
          : "(max-width: 768px) 92vw, 1100px"
      }
      loading={featured ? "eager" : "lazy"}
      fetchPriority={featured ? "high" : undefined}
      decoding="async"
      className={
        card
          ? "aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          : "mx-auto h-auto max-h-[680px] w-auto max-w-full rounded-sm object-contain"
      }
    />
  );
}
