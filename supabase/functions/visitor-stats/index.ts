import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const automatedPattern = /(?:\bbot\b|crawler|spider|headlesschrome|lighthouse|pagespeed|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|ahrefsbot|bingbot|googlebot|shapbot|reflectionbot|playwright|puppeteer|selenium|cypress|webdriver|curl\/|wget\/|python-requests|node\.js|X11; Linux x86_64.*Chrome\/121\.0\.0\.0|Windows NT 10\.0; Win64; x64.*Chrome\/119\.0\.0\.0)/i;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const now = Date.now();
    const allSince = new Date(now - 180 * 24 * 60 * 60 * 1000).toISOString();
    const weekSince = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const rows: Array<{visitor_id: string | null; user_agent: string | null; created_at: string}> = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase.from("page_visits")
        .select("visitor_id,user_agent,created_at")
        .gte("created_at", allSince)
        .order("created_at", { ascending: false })
        .range(offset, offset + 999);
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    const humanLike = rows.filter(row => row.visitor_id && !automatedPattern.test(row.user_agent || ""));
    const totalVisitors = new Set(humanLike.map(row => row.visitor_id)).size;
    const weeklyVisitors = new Set(humanLike.filter(row => row.created_at >= weekSince).map(row => row.visitor_id)).size;
    return new Response(JSON.stringify({
      total_visitors: totalVisitors,
      weekly_visitors: weeklyVisitors,
      metric: "distinct_browser_ids",
      window_days: 180,
      note: "Estimation basée sur les identifiants de navigateur enregistrés; les robots explicitement identifiables sont exclus. Les signatures de navigateur obsolètes à volume anormal sont également exclues. Ce n’est pas une mesure parfaite des personnes réelles.",
      updated_at: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("visitor-stats:", error);
    return new Response(JSON.stringify({ total_visitors: 0, weekly_visitors: 0, metric: "unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
