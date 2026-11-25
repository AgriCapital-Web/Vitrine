import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE_URL = "https://www.agricapital.ci";
const DIST = path.resolve("dist");
const MANIFEST_PATH = path.join(DIST, ".vite", "manifest.json");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const escapeXml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const titleFromPath = (value) => {
  const base = path.basename(value, path.extname(value));
  return base
    .replace(/\b\d{8,}\b/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("fr-FR"));
};

const isExcluded = (source) => {
  const normalized = source.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return /bureau de proximite|\bbaf\b|community[-_ ]meeting|prospect[-_ ]meeting|team[-_ ]|agricapital[-_ ]team|placeholder|favicon|og-image|logo|poster|android-chrome|apple-touch-icon/.test(normalized);
};

const images = new Map();
const addImage = (urlPath, source, title) => {
  if (!urlPath || isExcluded(source)) return;
  const url = BASE_URL + "/" + urlPath.replace(/^\/+/, "").replace(/\\/g, "/");
  if (!images.has(url)) images.set(url, { url, title: title || titleFromPath(source) || "AgriCapital" });
};

if (!existsSync(MANIFEST_PATH)) {
  throw new Error("Manifeste Vite absent : activez build.manifest avant de générer le sitemap d’images.");
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
for (const [key, entry] of Object.entries(manifest)) {
  const source = entry.src || key;
  if (!String(source).startsWith("src/assets/")) continue;
  if (!IMAGE_EXTENSIONS.has(path.extname(entry.file || "").toLowerCase())) continue;
  addImage(entry.file, source, titleFromPath(source));
}

// Les fichiers publics conservent une URL stable. Pour les doublons JPG/WEBP,
// une seule version est publiée dans le sitemap, avec priorité au WEBP.
const publicRoot = path.resolve("public");
const publicFiles = [];
const walk = (directory) => {
  if (!existsSync(directory)) return;
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) walk(fullPath);
    else if (IMAGE_EXTENSIONS.has(path.extname(item.name).toLowerCase())) publicFiles.push(fullPath);
  }
};
walk(publicRoot);

const publicGroups = new Map();
for (const fullPath of publicFiles) {
  const relative = path.relative(publicRoot, fullPath).replace(/\\/g, "/");
  if (isExcluded(relative)) continue;
  const extension = path.extname(relative).toLowerCase();
  const key = relative.slice(0, -extension.length).toLowerCase();
  const current = publicGroups.get(key);
  const rank = (ext) => ext === ".webp" ? 0 : ext === ".avif" ? 1 : ext === ".jpg" || ext === ".jpeg" ? 2 : 3;
  if (!current || rank(extension) < rank(path.extname(current).toLowerCase())) publicGroups.set(key, relative);
}
for (const relative of publicGroups.values()) {
  addImage(relative, relative, titleFromPath(relative));
}

const orderedImages = [...images.values()].sort((a, b) => a.title.localeCompare(b.title, "fr"));
const galleryUrl = BASE_URL + "/galerie-images.html";
const imageEntries = orderedImages.map((item) =>
  "    <image:image><image:loc>" + escapeXml(item.url) + "</image:loc><image:title>" +
  escapeXml(item.title) + "</image:title></image:image>"
).join("\n");

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  "  <url>",
  "    <loc>" + escapeXml(galleryUrl) + "</loc>",
  imageEntries,
  "  </url>",
  "</urlset>",
].join("\n");

const gallery = `<!doctype html>
<html lang="fr-CI">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Galerie AgriCapital | Activités agricoles et réalisations terrain</title>
  <meta name="description" content="Découvrez les images des activités de terrain, formations, pépinières, plantations et réalisations d’AgriCapital en Côte d’Ivoire.">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${galleryUrl}">
  <meta property="og:title" content="Galerie AgriCapital | Activités agricoles et réalisations terrain">
  <meta property="og:description" content="Images des activités de terrain, formations, pépinières et plantations AgriCapital en Côte d’Ivoire.">
  <meta property="og:type" content="website">
  <style>
    *{box-sizing:border-box}body{margin:0;background:#f6f8f5;color:#183326;font:16px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    header,footer{padding:28px max(20px,calc((100vw - 1180px)/2));background:#fff}
    header{border-bottom:1px solid #dce6dc}header a{color:#087d47;font-weight:700;text-decoration:none}
    h1{margin:14px 0 8px;font-size:clamp(1.8rem,4vw,2.8rem);line-height:1.15}
    main{max-width:1180px;margin:0 auto;padding:28px 20px 48px}
    .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:18px}
    figure{margin:0;overflow:hidden;border:1px solid #dce6dc;border-radius:14px;background:#fff}
    figure img{display:block;width:100%;height:230px;object-fit:cover;background:#e8eee8}
    figcaption{padding:10px 12px;font-size:14px;font-weight:600}
    footer{border-top:1px solid #dce6dc;text-align:center;font-size:14px}footer a{color:#087d47}
  </style>
</head>
<body>
  <header><a href="/">AgriCapital</a><h1>Nos activités et réalisations en images</h1><p>Photographies des formations, pépinières, plantations, visites et activités menées sur le terrain en Côte d’Ivoire.</p></header>
  <main><div class="gallery">
    ${orderedImages.map((item) => `<figure><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title)} — AgriCapital" loading="lazy" decoding="async"><figcaption>${escapeHtml(item.title)}</figcaption></figure>`).join("\n    ")}
  </div></main>
  <footer><a href="/">Retour au site AgriCapital</a></footer>
</body>
</html>`;

writeFileSync(path.join(DIST, "image-sitemap.xml"), sitemap, "utf8");
writeFileSync(path.join(DIST, "galerie-images.html"), gallery, "utf8");
console.log(`Sitemap d’images généré : ${orderedImages.length} images stratégiques (photos du dossier Bureau de proximité exclues)`);
