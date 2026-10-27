"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminGet } from "@/lib/auth/api-client";
interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
}
export default function BlogAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    adminGet("/api/admin/blog")
      .then(async (r) => {
        const result = await r.json();
        if (!r.ok) throw new Error(result.error);
        setPosts(result.data || []);
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div className="text-slate-800">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold normal-case">Blog articles</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-[#354325] px-5 py-3 text-white"
        >
          New article
        </Link>
      </div>
      <p className="mb-6 text-slate-600">
        Published stories appear automatically on the blog and sitemap. The
        homepage shows the latest three. Save an article as a draft to remove it
        from public pages.
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="space-y-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/admin/blog/${p.id}`}
            className="flex flex-wrap justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 hover:border-[#71854d]"
          >
            <span className="font-semibold">{p.title}</span>
            <span className="text-sm">
              {p.category} · {p.status} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
