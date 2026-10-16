import { spawn } from "node:child_process";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const ORIGIN = "http://127.0.0.1:4179";
const PUBLIC_ROUTES = [
  "/", "/a-propos", "/notre-approche", "/impact", "/jalons", "/fondateur",
  "/partenariat", "/temoignages", "/equipe", "/contact", "/faq", "/evolution",
  "/partenariat-demande", "/partnership-request", "/new", "/actualites", "/news",
  "/tresor-foncier", "/tresor-palmier", "/solutions", "/services", "/palminvest",
  "/palminvest-plus", "/terrapalm", "/terrapalm-plus", "/palmterroir",
  "/palmterroir-essentielle", "/solutions/palminvest", "/solutions/terrapalm",
  "/solutions/palmterroir", "/partenariats", "/partnerships", "/home", "/about",
  "/approach", "/milestones", "/founder", "/partnership", "/team", "/testimonials"
];

const server = spawn(process.execPath, [
  "node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1",
  "--port", "4179", "--strictPort"
], { stdio: "inherit", env: process.env });

let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(ORIGIN);
      if (response.ok) { ready = true; break; }
    } catch {}
    await delay(500);
  }
  if (!ready) throw new Error("Vite preview did not start in time");

  const { chromium } = await import("playwright-core");
  const chromiumBinary = (await import("@sparticuz/chromium")).default;
  browser = await chromium.launch({ headless: true, args: chromiumBinary.args, executablePath: await chromiumBinary.executablePath() });
  const page = await browser.newPage({ locale: "fr-CI", viewport: { width: 1440, height: 1000 } });
  page.setDefaultNavigationTimeout(15000);

  let rendered = 0;
  const queue = [...PUBLIC_ROUTES];
  const visited = new Set();
  const isPublicPath = (path) => {
    if (!path.startsWith("/") || path.startsWith("//")) return false;
    if (/\.(?:js|css|png|jpe?g|webp|svg|ico|xml|json|pdf|woff2?)$/i.test(path)) return false;
    if (/^\/(?:admin|admin-setup|dataroom|data|cloud|agricapital-cloud|api)(?:\/|$)/i.test(path)) return false;
    return true;
  };

  // Bound discovery and per-page waits so one slow route cannot hold up production deployment.
  while (queue.length && visited.size < 80) {
    const route = queue.shift();
    if (!route || visited.has(route)) continue;
    visited.add(route);
    try {
      await page.goto(ORIGIN + route, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForFunction(() => {
        const root = document.querySelector("#root");
        return !!root && (root.innerText.trim().length > 80 || !!root.querySelector("main"));
      }, { timeout: 5000 }).catch(() => {});
      // A short settling window is enough for public page content and lazy route chunks.
      await page.waitForTimeout(250);
      const discovered = await page.locator("a[href]").evaluateAll((anchors, origin) => anchors.map((anchor) => {
        try {
          const url = new URL(anchor.href, origin);
          return url.origin === origin ? url.pathname.replace(/\/+$/, "") || "/" : null;
        } catch { return null; }
      }), ORIGIN);
      for (const path of discovered) {
        if (path && isPublicPath(path) && !visited.has(path) && !queue.includes(path)) queue.push(path);
      }
      let html = await page.content();
      html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">');
      html = html.replace(/<meta\s+name=["']googlebot["'][^>]*>\s*/gi, "");
      const rootText = await page.locator("#root").innerText().catch(() => "");
      if (rootText.trim().length < 40) {
        console.warn("[prerender] Skipped near-empty public route:", route);
        continue;
      }
      const relative = route === "/" ? "index.html" : join(route.replace(/^\/+/, ""), "index.html");
      const target = join(process.cwd(), "dist", relative);
      await mkdir(join(target, ".."), { recursive: true });
      await writeFile(target, html, "utf8");
      rendered++;
      console.log("[prerender] Rendered", route);
    } catch (error) {
      console.warn("[prerender] Route failed; keeping SPA fallback:", route, String(error));
    }
  }
  for (const relative of ["sitemap.xml", "actualites/index.html", "new/index.html", "news/index.html"]) {
    await unlink(join(process.cwd(), "dist", relative)).catch(() => {});
  }
  await unlink(join(process.cwd(), "public", "sitemap.xml")).catch(() => {});
  console.log("[prerender] Removed static news-index/sitemap artifacts so live rewrites stay current.");
  console.log("[prerender] Rendered", rendered, "public routes; private/admin/data-room routes are excluded.");
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill("SIGTERM");
}
