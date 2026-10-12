import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : null;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    const pagePath = clean(body?.page_path, 500) || "/";
    const userAgent = clean(body?.user_agent, 1000) || req.headers.get("user-agent") || "";
    const automatedPattern = /(?:\bbot\b|crawler|spider|headlesschrome|lighthouse|pagespeed|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|ahrefsbot|bingbot|googlebot|shapbot|reflectionbot|playwright|puppeteer|selenium|cypress|webdriver|curl\/|wget\/|python-requests|node\.js)/i;
    const incomingReferrer = clean(body?.referrer, 1000) || "";

    if (
      body?.automation_flag === true ||
      automatedPattern.test(userAgent) ||
      /(?:lovable\.app|lovable\.dev|gpt-engineer-file-uploads)/i.test(incomingReferrer)
    ) {
      return new Response(JSON.stringify({ ok: true, ignored: true, reason: "automated_traffic" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const visitorId = clean(body?.visitor_id, 200);
    if (!visitorId) {
      return new Response(JSON.stringify({ ok: false, error: "visitor_id_required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Prefer trusted edge/proxy geo headers; body fields are only proxy-provided fallbacks.
    const cf = (req as Request & { cf?: Record<string, string> }).cf || {};
    const countryCode = clean(cf.country, 8) || clean(body?.geo_country_code, 8) || clean(req.headers.get("x-vercel-ip-country"), 8);
    const country = clean(cf.country_name, 100) || clean(body?.geo_country, 100) || countryCode;
    const city = clean(cf.city, 120) || clean(body?.geo_city, 120);
    const region = clean(cf.region, 120) || clean(body?.geo_region, 120);

    // Atomic database-side lock prevents duplicate inserts when two requests race.
    const { data: inserted, error } = await supabase.rpc("record_page_visit_deduplicated", {
      p_page_path: pagePath,
      p_visitor_id: visitorId,
      p_user_agent: userAgent,
      p_referrer: clean(body?.referrer, 1000),
      p_country_code: countryCode,
      p_country: country,
      p_city: city,
      p_region: region,
    });
    if (error) throw error;

    return new Response(JSON.stringify({
      ok: true,
      deduplicated: inserted === false,
      geo_recorded: Boolean(countryCode || country || city),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("record-visit:", error);
    return new Response(JSON.stringify({ ok: false }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
