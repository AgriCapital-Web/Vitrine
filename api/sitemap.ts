const SUPABASE_URL = "https://sxsolthkxfavimitoowy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmxlIiwicmVmIjoic3hzb2x0aGt4ZmF2aW1pdG93eSIsInJvbGUiOiJhcGlfcm9sZSIsImlhdCI6MTc3MTI2NzE0NywiZXhwIjoyMDg2ODQzMTQzfQ.H7dkzy1hh1L5kkLIviDtqSrR3rPfCXWoalJHNWv12fE";
const BASE_URL = "https://www.agricapital.ci";

const staticPaths = [
  "/", "/a-propos", "/notre-approche", "/impact", "/fondateur", "/equipe",
  "/contact", "/solutions", "/services", "/palminvest", "/terrapalm",
  "/palmterroir", "/tresor-foncier", "/tresor-palmier", "/evolution",
  "/actualites", "/new", "/temoignages", "/partenariats", "/partnership-request",
  "/faq"
];

const xmlEscape = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export default async function handler() {
  const urls = new Map<string, string>();
  for (const path of staticPaths) urls.set(path, "");

  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/news?select=slug,updated_at,published_at&is_published=eq.true&order=published_at.desc&limit=2000",
      { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } },
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

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
