import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createHash, randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin, isAuthError } from "@/lib/auth/api-auth";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  const { data, error } = await supabaseAdmin
    .from("blog_media")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json(error ? { error: error.message } : { data }, {
    status: error ? 500 : 200,
  });
}
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;
  try {
    const form = await request.formData();
    const file = form.get("file");
    const alt = String(form.get("alt") || "").trim();
    const caption = String(form.get("caption") || "").trim();
    const generated = form.get("generated") === "true";
    if (!(file instanceof File) || file.size > 4 * 1024 * 1024)
      throw new Error("Choose a photograph up to 4 MB.");
    if (!alt || !caption)
      throw new Error("Add accurate alt text and a useful caption.");
    if (generated && !/editorial illustration/i.test(caption))
      throw new Error(
        "Label generated images as editorial illustrations in the caption.",
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const source_hash = createHash("sha256").update(bytes).digest("hex");
    const pixels = await sharp(bytes, { limitInputPixels: 50000000 })
      .rotate()
      .resize(16, 16, { fit: "fill" })
      .greyscale()
      .raw()
      .toBuffer();
    const mean = pixels.reduce((sum, n) => sum + n, 0) / pixels.length;
    const fingerprint = [...pixels]
      .map((n) => (n >= mean ? "1" : "0"))
      .join("");
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("blog_media")
      .select("id,source_hash,fingerprint,owner_id");
    if (lookupError) throw lookupError;
    if (
      existing?.some(
        (m) =>
          m.source_hash === source_hash ||
          (m.fingerprint.length === fingerprint.length &&
            [...fingerprint].filter((b, i) => b !== m.fingerprint[i]).length <=
              8),
      )
    )
      throw new Error(
        "This photo, or a very similar version, is already registered. Use the original library entry; cropping or renaming does not make a new photograph.",
      );
    const name =
      file.name
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 70) || "photograph";
    const id = randomUUID();
    const variants: { src: string; width: number }[] = [];
    let width = 0,
      height = 0,
      src = "";
    for (const size of [480, 960, 1600]) {
      let quality = 82;
      let result = await sharp(bytes)
        .rotate()
        .resize({
          width: size,
          height: size,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer({ resolveWithObject: true });
      while (result.data.length > 250000 && quality > 48) {
        quality -= 7;
        result = await sharp(bytes)
          .rotate()
          .resize({
            width: size,
            height: size,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality })
          .toBuffer({ resolveWithObject: true });
      }
      const path = `${id}/${name}-${size}.webp`;
      const { error } = await supabaseAdmin.storage
        .from("blog-images")
        .upload(path, result.data, {
          contentType: "image/webp",
          cacheControl: "31536000",
        });
      if (error) throw error;
      src = supabaseAdmin.storage.from("blog-images").getPublicUrl(path)
        .data.publicUrl;
      width = result.info.width;
      height = result.info.height;
      if (!variants.some((v) => v.width === width))
        variants.push({ src, width });
    }
    const { data, error } = await supabaseAdmin
      .from("blog_media")
      .insert({
        id,
        src,
        source_hash,
        fingerprint,
        source_name: file.name,
        width,
        height,
        variants,
        alt,
        caption,
        generated,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Photo upload failed" },
      { status: 400 },
    );
  }
}
