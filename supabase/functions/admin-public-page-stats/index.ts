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
    const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const events: any[] = [];
    for (let offset = 0; offset < 10000; offset += 1000) {
      const { data, error } = await serviceClient
        .from("public_page_events")
        .select("page_path,referrer_host,device_type,created_at")
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .range(offset, offset + 999);
      if (error) throw error;
      events.push(...(data || []));
      if (!data || data.length < 1000) break;
    }

    const now = new Date();
    const todayStart = new Date(now); todayStart.setUTCHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setUTCDate(weekStart.getUTCDate() - 6); weekStart.setUTCHours(0, 0, 0, 0);
    const monthStart = new Date(now); monthStart.setUTCDate(monthStart.getUTCDate() - 30);
    const pageCounts: Record<string, number> = {};
    const referrerCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setUTCDate(date.getUTCDate() - i);
      date.setUTCHours(0, 0, 0, 0);
      dailyCounts[date.toISOString().slice(0, 10)] = 0;
    }

    let todayVisits = 0;
    let weekVisits = 0;
    let monthVisits = 0;
    for (const event of events) {
      const pagePath = event.page_path || "/";
      pageCounts[pagePath] = (pageCounts[pagePath] || 0) + 1;
      const referrer = event.referrer_host || "Accès direct";
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
      const device = deviceLabels[event.device_type] || deviceLabels.unknown;
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      const createdAt = new Date(event.created_at);
      if (createdAt >= todayStart) todayVisits += 1;
      if (createdAt >= weekStart) weekVisits += 1;
      if (createdAt >= monthStart) monthVisits += 1;
      const day = createdAt.toISOString().slice(0, 10);
      if (dailyCounts[day] !== undefined) dailyCounts[day] += 1;
    }

    const dailyVisits = Object.entries(dailyCounts).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", timeZone: "UTC" }),
      count,
    }));
    const topPages = Object.entries(pageCounts)
      .map(([page_path, count]) => ({ page_path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    const topDevices = Object.entries(deviceCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    return new Response(JSON.stringify({
      periodDays: 180,
      totalVisits: events.length,
      todayVisits,
      weekVisits,
      monthVisits,
      topPages,
      dailyVisits,
      topReferrers,
      topDevices,
      recentPageViews: events.slice(0, 20),
    }), { headers: corsHeaders });
  } catch (error) {
    console.error("admin-public-page-stats:", error);
    return new Response(JSON.stringify({ error: "Analytics unavailable" }), { status: 500, headers: corsHeaders });
  }
});
