const SUPABASE_URL = "https://sxsolthkxfavimitoowy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c29sdGhreGZhdmltaXRvb3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjcxNDcsImV4cCI6MjA4Njg0MzE0N30.H7dkzy1hh1L5kkLIviDtqSrR3rPfCXWoalJHNWv12fE";
const BASE_URL = "https://www.agricapital.ci";

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const stripHtml = (value: unknown) => String(value ?? "")
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/\s+/g, " ").trim();

export default async function handler(_req: any, res: any) {
  const response = await fetch(
    SUPABASE_URL + "/rest/v1/news?select=slug,title_fr,title,excerpt_fr,excerpt,content_fr,featured_image,published_at,updated_at,category&is_published=eq.true&order=published_at.desc&limit=200",
    { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` }, signal: AbortSignal.timeout(8000), cache: "no-store" },
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("[news-index] Supabase request failed", response.status, errorBody.slice(0, 300));
    return res.status(502).send("Unable to load public news");
  }
  const articles = await response.json();
  const cards = articles.map((article: any) => {
    if (typeof article?.slug !== "string" || !/^[a-zA-Z0-9-]+$/.test(article.slug)) return "";
    const title = stripHtml(article.title_fr || article.title || "Actualité AgriCapital");
    const description = stripHtml(article.excerpt_fr || article.excerpt || article.content_fr || "").slice(0, 500);
    const url = BASE_URL + "/new/" + encodeURIComponent(article.slug);
    const image = typeof article.featured_image === "string" && /^https?:\/\//i.test(article.featured_image)
      ? '<img src="' + escapeHtml(article.featured_image) + '" alt="' + escapeHtml(title) + '" loading="lazy">'
      : "";
    const date = article.published_at || article.updated_at || "";
    const time = date ? '<time datetime="' + escapeHtml(date) + '">' + escapeHtml(date.slice(0, 10)) + '</time>' : "";
    return '<article><a href="' + escapeHtml(url) + '">' + image + '<h2>' + escapeHtml(title) + '</h2></a>' +
      time + (description ? '<p>' + escapeHtml(description) + '</p>' : "") +
      '<p><a href="' + escapeHtml(url) + '">Lire l’article complet</a></p></article>';
  }).filter(Boolean).join("\n");

  const html = '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Actualités AgriCapital | Investissement agricole en Côte d’Ivoire</title>' +
    '<meta name="description" content="Toutes les actualités publiques d’AgriCapital : projets agricoles, plantations, foncier et investissement agricole en Côte d’Ivoire.">' +
    '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">' +
    '<link rel="canonical" href="' + BASE_URL + '/actualites">' +
    '<meta property="og:type" content="website"><meta property="og:site_name" content="AgriCapital">' +
    '<meta property="og:title" content="Actualités AgriCapital">' +
    '<meta property="og:url" content="' + BASE_URL + '/actualites">' +
    '</head><body><main id="main-content"><header><h1>Actualités AgriCapital</h1>' +
    '<p>Les publications et actualités publiques d’AgriCapital.</p></header>' +
    (cards || "<p>Aucune actualité publiée pour le moment.</p>") +
    '<p><a href="' + BASE_URL + '">Retour au site AgriCapital</a></p></main></body></html>';

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(200).send(html);
}
