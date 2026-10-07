import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const SUPABASE_URL = "https://sxsolthkxfavimitoowy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c29sdGhreGZhdmltaXRvd3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3MTI2NzE0NywiZXhwIjoyMDg2ODQzMTQzfQ.H7dkzy1hh1L5kkLIviDtqSrR3rPfCXWoalJHNWv12fE";
const BASE_URL = "https://www.agricapital.ci";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const absoluteUrl = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return BASE_URL + "/og-image.png";
  if (/^https?:\/\//i.test(raw)) return raw;
  return BASE_URL + "/" + raw.replace(/^\/+/, "");
};

const localized = (article: Record<string, any>, field: string) =>
  article[field + "_fr"] || article[field] || "";

const firstImage = (article: Record<string, any>) => {
  try {
    const value = Array.isArray(article.images) ? article.images : JSON.parse(article.images || "[]");
    if (Array.isArray(value) && value.length) return absoluteUrl(value[0]);
  } catch {}
  return absoluteUrl(article.featured_image);
};

const replaceMeta = (html: string, attr: "name" | "property", key: string, value: string) => {
  const re = new RegExp("<meta\\s+[^>]*\\b" + attr + "=[\"']" + key + "[\"'][^>]*>", "i");
  const tag = "<meta " + attr + "=\"" + key + "\" content=\"" + escapeHtml(value) + "\">";
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", "  " + tag + "\n</head>");
};

const replaceLink = (html: string, rel: string, href: string) => {
  const re = new RegExp("<link\\s+[^>]*\\brel=[\"']" + rel + "[\"'][^>]*>", "i");
  const tag = "<link rel=\"" + rel + "\" href=\"" + escapeHtml(href) + "\">";
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", "  " + tag + "\n</head>");
};

const renderArticleShell = (shell: string, article: Record<string, any>, slug: string) => {
  const title = stripHtml(article.meta_title || localized(article, "title")).slice(0, 200) || "Actualité AgriCapital";
  const description =
    stripHtml(article.meta_description || localized(article, "excerpt") || localized(article, "content"))
      .replace(/#\S+/g, "")
      .slice(0, 300) ||
    "Découvrez les dernières actualités d’AgriCapital.";
  const image = absoluteUrl(article.featured_image || firstImage(article));
  const keyword = stripHtml(article.focus_keyword || "");
  const url = BASE_URL + "/new/" + encodeURIComponent(slug);
  const published = article.published_at || article.created_at || "";
  const modified = article.updated_at || published;
  const section = stripHtml(article.category || "Actualité");
  const keywords = keyword;

  let html = shell.replace(/<title>[\s\S]*?<\/title>/i, "<title>" + escapeHtml(title) + "</title>");
  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "name", "keywords", keywords);
  html = replaceMeta(html, "name", "robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
  html = replaceMeta(html, "property", "og:type", "article");
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "property", "og:url", url);
  html = replaceMeta(html, "property", "og:image", image);
  html = replaceMeta(html, "property", "og:image:url", image);
  html = replaceMeta(html, "property", "og:image:secure_url", image);
  html = replaceMeta(html, "property", "og:image:width", "1200");
  html = replaceMeta(html, "property", "og:image:height", "630");
  html = replaceMeta(html, "property", "og:image:alt", title);
  html = replaceMeta(html, "property", "og:locale", "fr_CI");
  html = replaceMeta(html, "property", "og:site_name", "AgriCapital");
  html = replaceMeta(html, "property", "article:published_time", published);
  html = replaceMeta(html, "property", "article:modified_time", modified);
  html = replaceMeta(html, "name", "twitter:card", "summary_large_image");
  html = replaceMeta(html, "name", "twitter:title", title);
  html = replaceMeta(html, "name", "twitter:description", description);
  html = replaceMeta(html, "name", "twitter:url", url);
  html = replaceMeta(html, "name", "twitter:image", image);
  html = replaceMeta(html, "name", "twitter:image:alt", title);
  html = replaceLink(html, "canonical", url);
  html = html.replace(/<link\s+[^>]*rel=["']alternate["'][^>]*>\s*/gi, "");

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title.slice(0, 110),
    description,
    image: [image],
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    articleSection: section,
    keywords,
    inLanguage: "fr-CI",
    author: { "@type": "Organization", name: "AgriCapital", url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: "AgriCapital",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: BASE_URL + "/og-image.png" },
    },
  };
  const jsonLd = "<script type=\"application/ld+json\">" + JSON.stringify(schema).replace(/<\//g, "<\\/") + "</script>";
  html = html.replace(/<script[^>]+id=["']agricapital-article-jsonld["'][^>]*>[\s\S]*?<\/script>/i, "");
  return html.replace("</head>", "  " + jsonLd + "\n</head>");
};

const main = async () => {
  const shell = await readFile(join(process.cwd(), "dist/index.html"), "utf8");
  const response = await fetch(
    SUPABASE_URL + "/rest/v1/news?select=*&is_published=eq.true&order=published_at.desc",
    { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } },
  );

  if (!response.ok) {
    console.warn("[news-meta] Supabase request failed:", response.status);
    return;
  }

  const articles = await response.json();
  let generated = 0;

  for (const article of articles) {
    if (!article?.slug) continue;
    const page = renderArticleShell(shell, article, article.slug);
    for (const prefix of ["new", "actualites", "news"]) {
      const target = join(process.cwd(), "dist", prefix, article.slug, "index.html");
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, page, "utf8");
    }
    generated++;
  }

  console.log("[news-meta] Generated metadata shells for", generated, "published articles.");
};

main().catch((error) => {
  console.error("[news-meta] Generation failed:", error);
  process.exitCode = 0;
});
