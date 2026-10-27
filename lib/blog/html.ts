import sanitizeHtml from "sanitize-html";
import { load } from "cheerio";
import type { BlogMedia } from "./types";

export function cleanArticle(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "a",
      "blockquote",
      "hr",
      "br",
      "img",
      "figure",
      "figcaption",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title", "width", "height"],
      th: ["scope", "colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    transformTags: { h1: "h2" },
  });
}
export function wordCount(html: string) {
  const $ = load(html);
  $("figure,figcaption,img").remove();
  $("p,h2,h3,li,td,th,blockquote").append(" ");
  return $.text().trim().split(/\s+/).filter(Boolean).length;
}
export function articleImageSources(html: string) {
  const $ = load(html);
  return $("img")
    .map((_, el) => $(el).attr("src") || "")
    .get();
}
export function prepareArticle(html: string, media: BlogMedia[]) {
  const $ = load(cleanArticle(html), {}, false);
  const toc: { id: string; label: string }[] = [];
  $("h2").each((index, el) => {
    const label = $(el).text();
    const id = `${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${index + 1}`;
    $(el).attr("id", id);
    toc.push({ id, label });
  });
  $("img").each((_, el) => {
    const item = media.find((m) => m.src === $(el).attr("src"));
    if (!item) {
      $(el).remove();
      return;
    }
    $(el).attr({
      alt: item.alt,
      width: String(item.width),
      height: String(item.height),
      loading: "lazy",
      decoding: "async",
      srcset: item.variants.map((v) => `${v.src} ${v.width}w`).join(", "),
      sizes: "(max-width: 768px) 92vw, 720px",
    });
    // The registry is authoritative; editor round-trips cannot silently lose captions.
    if ($(el).parent().is("figure"))
      $(el)
        .parent()
        .replaceWith(`<figure>${$.html(el)}<figcaption></figcaption></figure>`);
    else if (
      $(el).parent().is("p") &&
      !$(el).parent().text().trim() &&
      $(el).parent().children().length === 1
    )
      $(el)
        .parent()
        .replaceWith(`<figure>${$.html(el)}<figcaption></figcaption></figure>`);
    else
      $(el).replaceWith(
        `<figure>${$.html(el)}<figcaption></figcaption></figure>`,
      );
  });
  $("figure").each((_, el) => {
    const m = media.find((m) => m.src === $(el).find("img").attr("src"));
    if (m) $(el).find("figcaption").text(m.caption);
  });
  $("table").wrap(
    '<div class="article-table" tabindex="0" role="region" aria-label="Comparison table"></div>',
  );
  return { html: $.html(), toc };
}
