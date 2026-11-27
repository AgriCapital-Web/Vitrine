import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigin = (origin: string) => /^https:\/\/(?:www\.)?agricapital\.ci$/.test(origin);

const isAutomated = (userAgent: string) =>
  /(?:\bbot\b|crawler|spider|headlesschrome|lighthouse|pagespeed|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|ahrefsbot|bingbot|googlebot|playwright|puppeteer|selenium|cypress|webdriver|curl\/|wget\/|python-requests|node\.js)/i.test(userAgent);

const getDeviceType = (userAgent: string) =>
  /ipad|tablet|kindle|silk/i.test(userAgent) ? "tablet"
  : /mobile|iphone|ipod|android/i.test(userAgent) ? "mobile"
  : userAgent ? "desktop" : "unknown";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const allowed = allowedOrigin(origin);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    ...(allowed ? {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    } : {}),
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (!allowed) return new Response(JSON.stringify({ ok: false }), { status: 403, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ ok: false }), { status: 405, headers });

  try {
    const userAgent = req.headers.get("user-agent") || "";
    const body = await req.json().catch(() => ({}));
    const automated = isAutomated(userAgent) || body?.automation_flag === true;
    const pagePath = typeof body?.page_path === "string" ? body.page_path.trim().slice(0, 2048) : "/";
    if (!pagePath.startsWith("/") || pagePath.startsWith("/admin")) {
      return new Response(JSON.stringify({ ok: false }), { status: 400, headers });
    }

    let referrerHost: string | null = null;
    if (typeof body?.referrer === "string" && body.referrer.trim()) {
      try {
        referrerHost = new URL(body.referrer).hostname.toLowerCase().replace(/^www\./, "").slice(0, 255) || null;
      } catch {
        referrerHost = null;
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { error } = await supabase.rpc("record_public_page_view", {
      p_page_path: pagePath,
      p_referrer_host: referrerHost,
      p_device_type: getDeviceType(userAgent),
      p_is_automated: automated,
    });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, counted: 1 }), { status: 200, headers });
  } catch (error) {
    console.error("record-public-visit:", error);
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers });
  }
});
