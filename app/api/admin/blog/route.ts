import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin, isAuthError } from "@/lib/auth/api-auth";
import { validatePost } from "@/lib/blog/validation";
import type { BlogMedia } from "@/lib/blog/types";
function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json(error ? { error: error.message } : { data }, {
    status: error ? 500 : 200,
  });
}
async function save(request: NextRequest, update: boolean) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  try {
    const body = await request.json();
    if (update && !body.id) throw new Error("Post ID required.");
    const { data: registry, error: mediaError } = await supabaseAdmin
      .from("blog_media")
      .select("id,src,width,height,variants,alt,caption,generated");
    if (mediaError) throw mediaError;
    const post = validatePost(body, (registry || []) as BlogMedia[]);
    if (update) {
      const { data: old } = await supabaseAdmin
        .from("blog_posts")
        .select("slug,status")
        .eq("id", body.id)
        .single();
      if (!old) throw new Error("Post not found.");
      if (old.slug !== post.slug)
        throw new Error(
          "Keep the saved URL slug to preserve links. Create a new draft for a different URL.",
        );
    }
    const query = update
      ? supabaseAdmin.from("blog_posts").update(post).eq("id", body.id)
      : supabaseAdmin.from("blog_posts").insert(post);
    const { data, error } = await query.select().single();
    if (error) throw new Error(error.message);
    refresh();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to save article",
      },
      { status: 400 },
    );
  }
}
export const POST = (request: NextRequest) => save(request, false);
export const PUT = (request: NextRequest) => save(request, true);
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const id = request.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  const { error } = await supabaseAdmin
    .from("blog_posts")
    .delete()
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  refresh();
  return NextResponse.json({ success: true });
}
