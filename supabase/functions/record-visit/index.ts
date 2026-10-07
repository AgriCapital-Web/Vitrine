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
    const visitorId = clean(body?.visitor_id, 200);
    if (!visitorId) return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("page_visits")
      .select("id")
      .eq("visitor_id", visitorId)
      .eq("page_path", pagePath)
      .gte("created_at", since)
      .limit(1);

    if (recent?.length) {
      return new Response(JSON.stringify({ ok: true, deduplicated: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const cf = (req as Request & { cf?: Record<string, string> }).cf || {};
    const countryCode = clean(cf.country, 8);
    const country = clean(cf.country, 100);
    const city = clean(cf.city, 120);
    const region = clean(cf.region, 120);

    const { error } = await supabase.from("page_visits").insert({
      page_path: pagePath,
      visitor_id: visitorId,
      user_agent: clean(body?.user_agent, 1000),
      referrer: clean(body?.referrer, 1000),
      country_code: countryCode,
      country,
      city,
      region,
    });

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("record-visit:", error);
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
