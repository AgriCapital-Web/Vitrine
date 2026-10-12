import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const automatedPattern = /(?:\bbot\b|crawler|spider|headlesschrome|lighthouse|pagespeed|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|ahrefsbot|bingbot|googlebot|shapbot|reflectionbot|playwright|puppeteer|selenium|cypress|webdriver|curl\/|wget\/|python-requests|node\.js)/i;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Keep the historical public counter intact. It is a cumulative visit counter,
    // not a count of unique people. Do not replace it with a filtered estimate.
    const { data: counter, error: counterError } = await supabase
      .from("visitor_counters")
      .select("total_visitors,weekly_visitors,updated_at")
      .eq("id", "public")
      .maybeSingle();
    if (counterError) throw counterError;

    // Return a separate quality metric so the public cumulative figure and the
    // estimated number of distinct browser IDs are never confused.
    const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const ids = new Set<string>();
    const weeklyIds = new Set<string>();
    const weekSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase.from("page_visits")
        .select("visitor_id,user_agent,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .range(offset, offset + 999);
      if (error) throw error;
      for (const row of data || []) {
        if (!row.visitor_id || automatedPattern.test(row.user_agent || "")) continue;
        ids.add(row.visitor_id);
        if (row.created_at >= weekSince) weeklyIds.add(row.visitor_id);
      }
      if (!data || data.length < 1000) break;
    }

    return new Response(JSON.stringify({
      total_visitors: Number(counter?.total_visitors) || 0,
      weekly_visitors: Number(counter?.weekly_visitors) || 0,
      estimated_unique_visitors_180d: ids.size,
      estimated_unique_visitors_7d: weeklyIds.size,
      metric: "historical_cumulative_visits",
      updated_at: counter?.updated_at || new Date().toISOString(),
      note: "Le compteur public historique est conservé. Les estimations de visiteurs distincts sont des métriques séparées, basées sur les identifiants de navigateur et le filtrage des agents automatisés connus."
    }), { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("visitor-stats:", error);
    return new Response(JSON.stringify({ error: "Visitor statistics unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
});
