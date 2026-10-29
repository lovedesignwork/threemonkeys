"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  adminGet,
  adminPost,
  adminPut,
  getAuthHeaders,
} from "@/lib/auth/api-client";
import type { BlogMedia } from "@/lib/blog/types";
const ArticleEditor = dynamic(() => import("./ArticleEditor"), { ssr: false });
type Media = BlogMedia & { owner_id: string | null };
const initial = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image: "",
  category: "Guide",
  tags: [] as string[],
  seo_title: "",
  seo_description: "",
  focus_keyword: "",
  status: "draft",
  author: "Three Monkeys Team",
  published_at: "",
};
export default function BlogEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [media, setMedia] = useState<Media[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [message, setMessage] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [generated, setGenerated] = useState(false);
  const update = (key: string, value: string) =>
    setPost((p) => ({ ...p, [key]: value }));
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await adminGet("/api/admin/blog/media");
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (active) setMedia(result.data || []);
        if (id) {
          const r = await adminGet(`/api/admin/blog/${id}`);
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          if (active) setPost({ ...initial, ...d.data });
        }
      } catch (e) {
        if (active)
          setMessage(e instanceof Error ? e.message : "Unable to load editor");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);
  async function save(status: string) {
    setBusy(true);
    setMessage("");
    try {
      const response = id
        ? await adminPut("/api/admin/blog", { ...post, id, status })
        : await adminPost("/api/admin/blog", { ...post, status });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPost({ ...initial, ...result.data });
      setMessage(
        status === "published"
          ? result.data.published_at && Date.parse(result.data.published_at) > Date.now()
            ? "Scheduled. The article will appear on the website at the selected Bangkok time."
            : "Published. Homepage, archive and sitemap now use this version."
          : "Draft saved. It is unavailable publicly.",
      );
      if (!id) router.replace(`/admin/blog/${result.data.id}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File) {
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("alt", alt);
      form.append("caption", caption);
      form.append("generated", String(generated));
      const headers = new Headers(await getAuthHeaders());
      headers.delete("Content-Type");
      const response = await fetch("/api/admin/blog/media", {
        method: "POST",
        headers,
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMedia((m) => [result.data, ...m]);
      setAlt("");
      setCaption("");
      setMessage("Photo optimized and added to the library.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  const available = media.filter((m) => !m.owner_id || m.owner_id === id);
  const words = post.content
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const photos =
    (post.featured_image ? 1 : 0) +
    (post.content.match(/<img\b/g) || []).length;
  const field = (
    key: keyof typeof initial,
    label: string,
    textarea = false,
  ) => (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {textarea ? (
        <textarea
          value={String(post[key] || "")}
          onChange={(e) => update(key, e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />
      ) : (
        <input
          value={String(post[key] || "")}
          onChange={(e) => update(key, e.target.value)}
          readOnly={key === "slug" && !!id}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3 read-only:bg-slate-100"
        />
      )}
    </label>
  );
  if (loading) return <p>Loading article…</p>;
  return (
    <div className="mx-auto max-w-6xl space-y-6 text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/blog" className="text-sm underline">
            ← All articles
          </Link>
          <h1 className="mt-2 text-2xl font-bold normal-case">
            {id ? "Edit article" : "New article"}
          </h1>
          <p className="mt-2 text-sm">
            {post.status} · {words} body words · {photos} images
          </p>
        </div>
        <div className="flex gap-3">
          <button
            disabled={busy}
            onClick={() => save("draft")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 disabled:opacity-50"
          >
            {post.status === 'published' ? 'Unpublish to draft' : 'Save draft'}
          </button>
          <button
            disabled={busy}
            onClick={() => save("published")}
            className="rounded-lg bg-[#354325] px-5 py-3 text-white disabled:opacity-50"
          >
            {busy
              ? "Saving…"
              : post.status === "published"
                ? "Update article"
                : "Publish"}
          </button>
        </div>
      </div>
      {message && (
        <p
          role="status"
          className="rounded-lg border border-slate-300 bg-white p-4"
        >
          {message}
        </p>
      )}
      {id && post.status === "published" && (!post.published_at || Date.parse(post.published_at) <= Date.now()) && (
        <a
          href={`/blog/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block underline"
        >
          View published article ↗
        </a>
      )}
      <div className="grid gap-6 rounded-xl bg-white p-6 md:grid-cols-2">
        {field("title", "Article headline")}
        {field("slug", "URL slug (keep after saving)")}
        {field("excerpt", "Short introduction", true)}
        {field("category", "Category")}
        {field("focus_keyword", "Target keyword")}
        {field("seo_title", "SEO title")}
        {field("seo_description", "Meta description", true)}
        <label className="block text-sm font-medium text-slate-700">
          Publication time (Asia/Bangkok, UTC+7)
          <input
            type="datetime-local"
            value={post.published_at ? new Date(Date.parse(post.published_at) + 7 * 60 * 60 * 1000).toISOString().slice(0,16) : ""}
            onChange={(e) => update("published_at", e.target.value ? new Date(`${e.target.value}:00+07:00`).toISOString() : "")}
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
          />
          <span className="mt-2 block text-xs font-normal">Leave blank for immediate publication of a new article. A future time schedules publication when you click Publish. Save draft keeps it private.</span>
        </label>
      </div>
      <p className="text-sm text-slate-600">
        Publish 800–1,600 words with one featured photo and 2–4 different body
        photos. Use H2/H3 headings. Publication dates appear in search metadata;
        the reading layout remains undated. Captions and alt text come from the photo library.
      </p>
      <ArticleEditor
        content={post.content}
        onChange={(content) => setPost((p) => ({ ...p, content }))}
      />
      <section className="space-y-5 rounded-xl bg-white p-6">
        <h2 className="text-xl font-bold normal-case">Article photographs</h2>
        <p className="text-sm text-slate-600">
          Photos assigned to other articles are excluded. Upload a new original
          photograph; renamed, cropped or edited copies still count as the same
          image.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Alt text
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="mt-2 w-full rounded border p-3"
              placeholder="Describe what the photograph shows"
            />
          </label>
          <label className="text-sm">
            Caption
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-2 w-full rounded border p-3"
              placeholder="Useful context for readers"
            />
          </label>
        </div>
        <label className="flex gap-3 text-sm">
          <input
            type="checkbox"
            checked={generated}
            onChange={(e) => setGenerated(e.target.checked)}
          />
          Generated editorial illustration (must be labelled in the caption)
        </label>
        <input
          aria-label="Upload original photograph"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={busy || !alt || !caption}
          onChange={(e) => {
            if (e.target.files?.[0]) upload(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((m) => (
            <div key={m.id} className="rounded-lg border p-3">
              <img
                src={m.src}
                width={m.width}
                height={m.height}
                alt={m.alt}
                className="h-36 w-full object-cover"
              />
              <p className="my-3 text-sm">{m.caption}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded bg-slate-100 px-3 py-2 text-xs"
                  onClick={() => update("featured_image", m.src)}
                >
                  {post.featured_image === m.src
                    ? "✓ Featured"
                    : "Use as featured"}
                </button>
                <button
                  className="rounded bg-slate-100 px-3 py-2 text-xs"
                  onClick={() =>
                    update(
                      "content",
                      `${post.content}<p><img src="${m.src}" alt="${m.alt.replace(/"/g, "&quot;")}" width="${m.width}" height="${m.height}" /></p><p></p>`,
                    )
                  }
                >
                  Insert in article
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
