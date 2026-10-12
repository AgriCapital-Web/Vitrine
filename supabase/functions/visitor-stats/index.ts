import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await supabase
      .from("visitor_counters")
      .select("total_visitors,weekly_visitors,updated_at")
      .eq("id", "public")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Historical public visitor counter row is missing");

    return new Response(JSON.stringify({
      total_visitors: Number(data.total_visitors) || 0,
      weekly_visitors: Number(data.weekly_visitors) || 0,
      metric: "historical_cumulative_visits",
      updated_at: data.updated_at,
      note: "Compteur historique cumulé conservé. Les estimations de visiteurs uniques sont disponibles séparément dans les analytiques."
    }), { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("visitor-stats:", error);
    return new Response(JSON.stringify({ error: "Visitor statistics unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
});
