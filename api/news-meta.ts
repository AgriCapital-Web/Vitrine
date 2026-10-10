const SUPABASE_URL = "https://sxsolthkxfavimitoowy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmxlIiwicmVmIjoic3hzb2x0aGt4ZmF2aW1pdG93eSIsInJvbGUiOiJhcGlfcm9sZSIsImlhdCI6MTc3MTI2NzE0NywiZXhwIjoyMDg2ODQzMTQzfQ.H7dkzy1hh1L5kkLIviDtqSrR3rPfCXWoalJHNWv12fE";
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

export default async function handler(req: Request) {
  const requestUrl = new URL(req.url);
  const slug = requestUrl.searchParams.get("slug")?.trim();
  if (!slug) return new Response("Missing slug", { status: 400 });

  const response = await fetch(
    SUPABASE_URL + "/rest/v1/news?select=*&slug=eq." + encodeURIComponent(slug) + "&is_published=eq.true&limit=1",
    { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } },
  );

  if (!response.ok) return new Response("Unable to load article", { status: 502 });
  const rows = await response.json();
  const article = rows[0];
  if (!article) return new Response("Article not found", { status: 404 });

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

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
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
<main>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(description)}</p>
<p><a href="${escapeHtml(canonical)}">Lire l’actualité sur AgriCapital</a></p>
</main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
