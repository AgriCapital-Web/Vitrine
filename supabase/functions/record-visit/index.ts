import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() => new Response(JSON.stringify({
  ok: false,
  deprecated: true,
  message: "Le suivi détaillé individuel a été désactivé. Le compteur public de pages vues est utilisé.",
}), {
  status: 410,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
}));
