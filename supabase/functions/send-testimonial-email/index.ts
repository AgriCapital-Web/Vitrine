import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const schema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email().max(255).optional().or(z.literal("")),
  testimonial: z.string().trim().min(1).max(5000),
  status: z.string().trim().min(1).max(100),
  subscriber: z.boolean().optional(),
  photoUrl: z.string().url().optional().nullable(),
});

const esc = (v: string) => v.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]!));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const data = schema.parse(await req.json());
    const key = Deno.env.get("BREVO_API_KEY");
    if (!key) throw new Error("Brevo is not configured");

    const html = `
      <h2>Nouveau témoignage à modérer – AgriCapital</h2>
      <p><strong>Nom :</strong> ${esc(data.firstName)} ${esc(data.lastName)}</p>
      <p><strong>Email :</strong> ${data.email ? esc(data.email) : "Non renseigné"}</p>
      <p><strong>Statut :</strong> ${esc(data.status)}</p>
      <p><strong>Abonné AgriCapital :</strong> ${data.subscriber ? "Oui" : "Non"}</p>
      ${data.photoUrl ? `<p><strong>Photo :</strong> <a href="${esc(data.photoUrl)}">Voir la photo</a></p>` : ""}
      <p><strong>Témoignage :</strong></p>
      <p>${esc(data.testimonial).replace(/\n/g, "<br>")}</p>
      <hr><p><em>Soumis depuis https://agricapital.ci</em></p>
    `;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "AgriCapital Témoignages", email: "contact@agricapital.ci" },
        to: [{ email: "agricapita.ci@gmail.com" }],
        subject: "Nouveau témoignage à modérer – AgriCapital",
        htmlContent: html,
        ...(data.email ? { replyTo: { email: data.email } } : {}),
      }),
    });
    if (!response.ok) throw new Error(await response.text());

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("send-testimonial-email:", error);
    return new Response(JSON.stringify({ success: false, error: "Impossible d'envoyer la notification." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
