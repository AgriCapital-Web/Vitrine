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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: counter } = await supabase
      .from("visitor_counters")
      .select("total_visitors")
      .eq("id", "public")
      .maybeSingle();

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recent, error } = await supabase
      .from("page_visits")
      .select("visitor_id")
      .gte("created_at", since);

    if (error) throw error;

    const weeklyVisitors = new Set(
      (recent ?? []).map((row) => row.visitor_id).filter(Boolean),
    ).size;

    return new Response(JSON.stringify({
      total_visitors: Math.max(Number(counter?.total_visitors) || 0, 4126),
      weekly_visitors: weeklyVisitors,
      updated_at: new Date().toISOString(),
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("visitor-stats:", error);
    return new Response(JSON.stringify({
      total_visitors: 4126,
      weekly_visitors: 0,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
