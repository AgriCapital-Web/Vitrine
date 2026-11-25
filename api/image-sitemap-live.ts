const SUPABASE_URL = "https://sxsolthkxfavimitoowy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c29sdGhreGZhdmltaXRvb3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjcxNDcsImV4cCI6MjA4Njg0MzE0N30.H7dkzy1hh1L5kkLIviDtqSrR3rPfCXWoalJHNWv12fE";
const BASE_URL = "https://www.agricapital.ci";

const xmlEscape = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const isEditoriallyExcluded = (item: { name?: string; alt_text_fr?: string | null }) => {
  const text = `${item.name ?? ""} ${item.alt_text_fr ?? ""}`
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return /\bbaf\b|bureau de proximite|community[-_ ]meeting|prospect[-_ ]meeting|team[-_ ]|agricapital[-_ ]team|photo privee|confidentiel|non diffusable/.test(text);
};

export default async function handler(_req: any, res: any) {
  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/site_media?select=name,url,alt_text_fr,created_at&is_active=eq.true&is_archived=eq.false&is_search_indexable=eq.true&order=created_at.desc&limit=1000",
      {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY,
        },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error("Lecture des images publiques impossible (HTTP " + response.status + ").");
    const media = await response.json() as Array<{ name?: string; url?: string; alt_text_fr?: string | null }>;
    const images = media.filter((item) =>
      typeof item.url === "string" &&
      item.url.startsWith("https://") &&
      !isEditoriallyExcluded(item)
    );
    const entries = images.map((item) => {
      const title = item.alt_text_fr?.trim() || item.name?.trim() || "Photographie AgriCapital";
      return "    <image:image><image:loc>" + xmlEscape(item.url) + "</image:loc><image:title>" +
        xmlEscape(title) + "</image:title></image:image>";
    }).join("\n");
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
      "  <url><loc>" + xmlEscape(BASE_URL + "/galerie-images.html") + "</loc>\n" +
      entries + "\n  </url>\n</urlset>";
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).send(xml);
  } catch (error) {
    console.error("[image-sitemap-live] génération impossible:", error);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"></urlset>');
  }
}
