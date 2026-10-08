// AgriCapital Cloud — signup (NDA + KYC + access-code delivery)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
function genCode(len = 6): string {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  let out = "";
  for (const b of buf) out += CHARS[b % CHARS.length];
  return out;
}

const escapeHtml = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const MAX_ID_BYTES = 5 * 1024 * 1024;
function detectDocType(b: Uint8Array): { ext: string; mime: string } | null {
  if (b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return { ext: "pdf", mime: "application/pdf" };
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: "png", mime: "image/png" };
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { ext: "webp", mime: "image/webp" };
  return null;
}

async function sha256(v: string): Promise<string> {
  const data = new TextEncoder().encode(v);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const {
      full_name, email, phone, whatsapp, profession, organization, country,
      profile_type, newsletter_optin, id_document_base64, id_document_ext,
    } = body ?? {};

    const cleanName = String(full_name ?? "").trim().slice(0, 160);
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    if (!cleanName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return new Response(JSON.stringify({ error: "Nom et e-mail requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Existing signatory? Ask them to use their code.
    const { data: existing } = await supabase
      .from("dataroom_signatories").select("id").eq("email", cleanEmail).maybeSingle();
    if (existing) {
      // Same response as a new signup: never reveal whether an e-mail is registered.
      return new Response(JSON.stringify({ ok: true, email_sent: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upload id document if provided
    let id_document_url: string | null = null;
    if (id_document_base64) {
      const rawBase64 = String(id_document_base64);
      if (rawBase64.length > 7_000_000) throw new Error("Pièce d’identité trop volumineuse (maximum 5 Mo).");
      const bytes = Uint8Array.from(atob(rawBase64.split(",").pop()!), (c) => c.charCodeAt(0));
      if (bytes.length > MAX_ID_BYTES) throw new Error("Pièce d’identité trop volumineuse (maximum 5 Mo).");
      const kind = detectDocType(bytes);
      if (!kind) {
        return new Response(JSON.stringify({ error: "Format de pièce d’identité non accepté (PDF, JPG, PNG ou WEBP)." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const path = `id-docs/${crypto.randomUUID()}.${kind.ext}`;
      const { error: upErr } = await supabase.storage.from("dataroom").upload(path, bytes, {
        contentType: kind.mime,
        upsert: false,
      });
      if (!upErr) id_document_url = path;
    }

    const code = genCode(16);
    const access_code_hash = await sha256(code);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    const { data: sig, error: insErr } = await supabase
      .from("dataroom_signatories").insert({
        full_name: cleanName, email: cleanEmail, phone, whatsapp, profession, organization, country,
        profile_type: profile_type ?? "autre",
        newsletter_optin: !!newsletter_optin,
        id_document_url, access_code_hash,
        ip_address: ip, user_agent: ua,
      }).select("id").single();
    if (insErr) throw insErr;

    // Send access code by email (best-effort via Resend)
    const resend = Deno.env.get("RESEND_API_KEY");
    if (resend) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "AgriCapital Cloud <contact@agricapital.ci>",
            to: [cleanEmail],
            subject: "Votre code d'accès AgriCapital Cloud",
            html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#111">
              <h2 style="color:#006B43;margin:0 0 12px">Bienvenue sur AgriCapital Cloud</h2>
              <p>Bonjour ${escapeHtml(cleanName)},</p>
              <p>Votre NDA a bien été signé et enregistré. Voici votre <strong>code d'accès personnel</strong> :</p>
              <p style="font-size:28px;font-weight:800;letter-spacing:2px;background:#f5f5f5;padding:16px;text-align:center;border-radius:8px;color:#006B43">${code}</p>
              <p>Conservez-le précieusement. Il vous permettra de vous reconnecter à tout moment.</p>
              <p style="color:#ED9600;font-weight:600">AgriCapital — Investir la terre. Cultiver l'avenir.</p>
            </div>`,
          }),
        });
      } catch (e) { console.warn("resend email failed", e); }
    }

    return new Response(JSON.stringify({ ok: true, signatory_id: sig.id, email_sent: !!resend }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dataroom-signup error", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
