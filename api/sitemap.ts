const SUPABASE_URL = "https://sxsolthkxfavimitoowy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c29sdGhreGZhdmltaXRvb3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjcxNDcsImV4cCI6MjA4Njg0MzE0N30.H7dkzy1hh1L5kkLIviDtqSrR3rPfCXWoalJHNWv12fE";
const BASE_URL = "https://www.agricapital.ci";

const staticPaths = [
  "/", "/a-propos", "/notre-approche", "/impact", "/fondateur", "/equipe",
  "/contact", "/solutions", "/plantation-cle-en-main", "/palminvest", "/terrapalm",
  "/palmterroir", "/tresor-foncier", "/tresor-palmier", "/evolution",
  "/actualites", "/temoignages", "/partenariats", "/faq"
];

const xmlEscape = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export default async function handler(_req: any, res: any) {
  const urls = new Map<string, string>();
  for (const path of staticPaths) urls.set(path, "");

  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/news?select=slug,updated_at,published_at&is_published=eq.true&order=published_at.desc&limit=2000",
      { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` }, signal: AbortSignal.timeout(8000), cache: "no-store" },
    );
    if (response.ok) {
      const articles = await response.json();
      for (const article of articles) {
        if (typeof article?.slug !== "string" || !/^[a-zA-Z0-9-]+$/.test(article.slug)) continue;
        urls.set("/new/" + article.slug, article.updated_at || article.published_at || "");
      }
    }
  } catch (error) {
    console.error("[sitemap] Could not load live news slugs:", error);
  }

  const entries = [...urls.entries()].map(([path, modified]) =>
    "  <url><loc>" + xmlEscape(BASE_URL + (path === "/" ? "" : path)) + "</loc>" +
    (modified ? "<lastmod>" + xmlEscape(new Date(modified).toISOString().slice(0, 10)) + "</lastmod>" : "") +
    "</url>"
  );

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join("\n") + "\n</urlset>";

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(200).send(xml);
}
