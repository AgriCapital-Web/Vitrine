// Utilitaire interne : exécute des migrations DDL privilégiées (storage.objects)
// Protégé par CRON_SECRET. Aucun usage côté client.
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== Deno.env.get("MIGRATE_SECRET")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sql = "";
  try {
    const body = await req.json();
    sql = String(body?.sql ?? "");
  } catch {
    return new Response(JSON.stringify({ error: "Corps JSON invalide" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!sql.trim()) {
    return new Response(JSON.stringify({ error: "sql requis" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const client = new Client(Deno.env.get("SUPABASE_DB_URL")!);
  try {
    await client.connect();
    const res = await client.queryObject(sql);
    return new Response(JSON.stringify({ ok: true, rows: res.rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    try { await client.end(); } catch { /* noop */ }
  }
});
