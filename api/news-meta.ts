const SUPABASE_URL = "https://sxsolthkxfavimitoowy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c29sdGhreGZhdmltaXRvb3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjcxNDcsImV4cCI6MjA4Njg0MzE0N30.H7dkzy1hh1L5kkLIviDtqSrR3rPfCXWoalJHNWv12fE";
const BASE_URL = "https://www.agricapital.ci";

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const stripHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/#\S+/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const absoluteUrl = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return BASE_URL + "/og-image.png";
  return /^https?:\/\//i.test(raw) ? raw : BASE_URL + "/" + raw.replace(/^\/+/, "");
};

const parseImages = (article: Record<string, any>) => {
  try {
    const value = Array.isArray(article.images) ? article.images : JSON.parse(article.images || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};


const sanitizeRichHtml = (value: unknown) => {
  let html = String(value ?? "");
  html = html.replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|meta|link)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  html = html.replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|meta|link)\b[^>]*\/?\s*>/gi, "");
  html = html.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/\s+(href|src|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "");
  html = html.replace(/\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  return html;
};

const renderPublicImages = (article: Record<string, any>, title: string) => {
  const images = parseImages(article);
  const entries = [article.featured_image, ...images].filter(Boolean);
  const seen = new Set<string>();
  return entries.map((entry: any) => {
    const url = typeof entry === "string" ? entry : String(entry?.url || entry?.src || "");
    if (!/^https?:\/\//i.test(url) || seen.has(url)) return "";
    seen.add(url);
    const caption = typeof entry === "object" && entry ? String(entry.caption_fr || entry.caption || entry.alt || "") : "";
    return '<figure><img src="' + escapeHtml(url) + '" alt="' + escapeHtml(caption || title) + '" loading="lazy"><figcaption>' + escapeHtml(caption) + '</figcaption></figure>';
  }).join("\n");
};

export default async function handler(req: any, res: any) {
  const requestUrl = new URL(req.url || "/", BASE_URL);
  const slug = requestUrl.searchParams.get("slug")?.trim();
  if (!slug) return res.status(400).send("Missing slug");

  const response = await fetch(
    SUPABASE_URL + "/rest/v1/news?select=*&slug=eq." + encodeURIComponent(slug) + "&is_published=eq.true&limit=1",
    { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` }, signal: AbortSignal.timeout(8000), cache: "no-store" },
  );

  if (!response.ok) return res.status(502).send("Unable to load article");
  const rows = await response.json();
  const article = rows[0];
  if (!article) return res.status(404).send("Article not found");

  // This endpoint serves crawlers and previews for canonical French URLs.
  // Prefer French editorial fields over potentially English SEO fields.
  const title = stripHtml(article.title_fr || article.title || article.meta_title).slice(0, 200) || "Actualité AgriCapital";
  const description = stripHtml(article.excerpt_fr || article.content_fr || article.meta_description).slice(0, 300) || "Découvrez les dernières actualités d’AgriCapital.";
  const image = absoluteUrl(article.featured_image || parseImages(article)[0] || "/og-image.png");
  const canonical = BASE_URL + "/new/" + encodeURIComponent(article.slug);
  const published = article.published_at || article.created_at || "";
  const modified = article.updated_at || published;
  const section = stripHtml(article.category || "Actualité");
  const keyword = stripHtml(article.focus_keyword || "");

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title.slice(0, 110),
    description,
    image: [image],
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    url: canonical,
    articleSection: section,
    keywords: keyword,
    inLanguage: "fr-CI",
    author: { "@type": "Organization", name: "AgriCapital", url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: "AgriCapital",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: BASE_URL + "/og-image.png" },
    },
  };

  const jsonLd = JSON.stringify(schema).replace(/<\//g, "<\\/");

  const articleBody = sanitizeRichHtml(article.content_fr || article.content || "");
  const excerpt = stripHtml(article.excerpt_fr || article.excerpt || "").slice(0, 500);
  const publicImages = renderPublicImages(article, title);
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="AgriCapital">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:url" content="${escapeHtml(image)}">
<meta property="og:image:secure_url" content="${escapeHtml(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(title)}">
<meta property="og:locale" content="fr_CI">
<meta property="article:published_time" content="${escapeHtml(published)}">
<meta property="article:modified_time" content="${escapeHtml(modified)}">
<meta property="article:section" content="${escapeHtml(section)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:url" content="${escapeHtml(canonical)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<meta name="twitter:image:alt" content="${escapeHtml(title)}">
<script type="application/ld+json">${jsonLd}</script>
</head>
<body>
<main id="main-content" class="public-article-content">
<article>
<header><p>AgriCapital · Actualités</p><h1>${escapeHtml(title)}</h1>
${published ? '<time datetime="' + escapeHtml(published) + '">' + escapeHtml(published.slice(0, 10)) + '</time>' : ''}
${excerpt ? '<p class="article-excerpt">' + escapeHtml(excerpt) + '</p>' : ''}
</header>
<div class="article-body">${articleBody}</div>
${publicImages}
<p><a href="${escapeHtml(canonical)}">Lire l’actualité sur AgriCapital</a> · <a href="${BASE_URL}/actualites">Toutes les actualités</a></p>
</article>
</main>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).send(html);
}
