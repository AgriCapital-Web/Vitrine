import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigin = (origin: string) =>
  /^https:\/\/(?:www\.)?agricapital\.ci$/.test(origin)
  || /^https:\/\/vitrine-[a-z0-9-]+\.vercel\.app$/.test(origin)
  || /^http:\/\/localhost:(?:5173|8080|4173)$/.test(origin);

const deviceLabels: Record<string, string> = {
  mobile: "Téléphone",
  tablet: "Tablette",
  desktop: "Ordinateur",
  unknown: "Non déterminé",
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const allowed = allowedOrigin(origin);
  const corsHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    ...(allowed ? {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    } : {}),
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (!allowed) return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers: corsHeaders });
  if (req.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });

  try {
    const authorization = req.headers.get("Authorization") || "";
    if (!authorization.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: isAdmin, error: permissionError } = await userClient.rpc("is_admin");
    if (permissionError || isAdmin !== true) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: stats, error: statsError } = await serviceClient.rpc("get_public_page_stats");
    if (statsError) throw statsError;
    return new Response(JSON.stringify(stats || {}), { headers: corsHeaders });
  } catch (error) {
    console.error("admin-public-page-stats:", error);
    return new Response(JSON.stringify({ error: "Analytics unavailable" }), { status: 500, headers: corsHeaders });
  }
});
