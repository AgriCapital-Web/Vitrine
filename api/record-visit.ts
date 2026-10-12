const COUNTRY_NAMES: Record<string, string> = {
  CI: "Côte d’Ivoire", FR: "France", SN: "Sénégal", ML: "Mali", BF: "Burkina Faso",
  GN: "Guinée", CM: "Cameroun", NG: "Nigeria", GH: "Ghana", TG: "Togo", BJ: "Bénin",
  MA: "Maroc", TN: "Tunisie", DZ: "Algérie", US: "États-Unis", CA: "Canada",
  BE: "Belgique", CH: "Suisse", DE: "Allemagne", GB: "Royaume-Uni", CN: "Chine",
  JP: "Japon", ES: "Espagne", IT: "Italie", PT: "Portugal", NL: "Pays-Bas",
  AE: "Émirats arabes unis", IN: "Inde", ZA: "Afrique du Sud", KE: "Kenya",
  CD: "République démocratique du Congo", CG: "Congo", NE: "Niger", MR: "Mauritanie",
  GM: "Gambie", SL: "Sierra Leone", LR: "Libéria", GA: "Gabon", CF: "République centrafricaine",
};

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const decodeHeader = (value: unknown, max: number) => {
  const raw = clean(value, max);
  try { return decodeURIComponent(raw.replace(/\+/g, " ")); } catch { return raw; }
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    console.error("[record-visit] Supabase public configuration is missing");
    return res.status(500).json({ error: "Analytics configuration unavailable" });
  }

  const userAgent = clean(req.headers["user-agent"], 1000);
  const automationFlag = Boolean(req.body && typeof req.body === "object" && (req.body as any).automation_flag === true);
  const incomingReferrer = clean(req.body && typeof req.body === "object" ? (req.body as any).referrer : "", 1000);
  if (/(?:lovable\.app|lovable\.dev|gpt-engineer-file-uploads)/i.test(incomingReferrer)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, ignored: true, reason: "preview_referrer" });
  }
  if (automationFlag || /(?:\bbot\b|crawler|spider|headlesschrome|lighthouse|pagespeed|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|ahrefsbot|bingbot|googlebot|shapbot|reflectionbot|playwright|puppeteer|selenium|cypress|webdriver|curl\/|wget\/|python-requests|node\.js|X11; Linux x86_64.*Chrome\/121\.0\.0\.0|Windows NT 10\.0; Win64; x64.*Chrome\/119\.0\.0\.0)/i.test(userAgent)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, ignored: true, reason: "automated_traffic" });
  }

  const countryCode = clean(req.headers["x-vercel-ip-country"] || req.headers["cf-ipcountry"], 8).toUpperCase();
  const country = COUNTRY_NAMES[countryCode] || countryCode;
  const city = decodeHeader(req.headers["x-vercel-ip-city"], 120);
  const region = decodeHeader(req.headers["x-vercel-ip-country-region"] || req.headers["x-vercel-ip-region"], 120);
  const payload = {
    ...(req.body && typeof req.body === "object" ? req.body : {}),
    geo_country_code: countryCode || null,
    geo_country: country || null,
    geo_city: city || null,
    geo_region: region || null,
  };

  try {
    const upstream = await fetch(supabaseUrl.replace(/\/$/, "") + "/functions/v1/record-visit", {
      method: "POST",
      headers: { apikey: anonKey, Authorization: "Bearer " + anonKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(7000),
    });
    const text = await upstream.text();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(upstream.status).send(text || JSON.stringify({ ok: upstream.ok }));
  } catch (error) {
    console.error("[record-visit] Upstream request failed", error);
    return res.status(502).json({ error: "Analytics request failed" });
  }
}
