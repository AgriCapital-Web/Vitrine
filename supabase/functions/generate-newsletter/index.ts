import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const audienceLabels: Record<string, string> = {
  all: "tous les contacts",
  testimonials: "personnes ayant laissé un témoignage",
  subscribers: "abonnés newsletter",
  investors: "investisseurs",
  prospects: "prospects commerciaux",
  partners: "partenaires techniques, financiers ou institutionnels",
  clients: "clients et planteurs",
  members: "membres de la communauté AgriCapital",
  custom: "segment personnalisé",
};

async function verifyAdmin(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Appels internes (cron / edge-to-edge) : service role ou secret cron
  const bearer = authHeader.replace("Bearer ", "").trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const cronSecret = Deno.env.get("CRON_SECRET");
  if ((serviceKey && bearer === serviceKey) || (cronSecret && req.headers.get("x-cron-secret") === cronSecret)) {
    return { userId: "system" };
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  if (!roleData) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return { userId: user.id };
}

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const stripHtml = (html: string) => html.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const SITE_ORIGIN = "https://www.agricapital.ci";
const DEFAULT_IMAGE_URL = `${SITE_ORIGIN}/__l5e/assets-v1/fe11784f-7405-48a2-a5b4-3ce4b088b453/plantation-cle-en-main.png`;
const DEFAULT_VIDEO_URL = `${SITE_ORIGIN}/__l5e/assets-v1/cb809930-adf4-4703-acc1-d41f3e54a02f/leve-topo.mp4`;
const DEFAULT_VIDEO_POSTER_URL = `${SITE_ORIGIN}/__l5e/assets-v1/78d51e8c-edc2-4973-8b84-bb6aad9180d2/leve-topo-poster.webp`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authResult = await verifyAdmin(req);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const targetAudience = typeof body.targetAudience === "string" ? body.targetAudience : "all";
    const includeImage = Boolean(body.includeImage);
    const includeVideo = Boolean(body.includeVideo);

    if (prompt.length < 2) {
      return new Response(JSON.stringify({ error: "Décrivez l'intention de la campagne" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const audience = audienceLabels[targetAudience] || audienceLabels.all;

    // Contexte réel du site : dernières actualités publiées (évite les emails vides ou génériques)
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let newsItems: { title: string; excerpt: string; slug: string; date: string }[] = [];
    try {
      const { data: news } = await svc
        .from("news")
        .select("slug, title_fr, excerpt_fr, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(5);
      newsItems = (news ?? []).map((n: any) => ({
        title: n.title_fr ?? "",
        excerpt: stripHtml(n.excerpt_fr ?? "").slice(0, 320),
        slug: n.slug,
        date: n.published_at ? new Date(n.published_at).toLocaleDateString("fr-FR") : "",
      }));
    } catch (e) {
      console.error("news context error", e);
    }

    const contextRequested = /actualité|actualites|actualités|news|dernier|dernière|dernières|nouveau|nouvelle|nouveauté|avancée|déploiement|publication|article/i.test(prompt);
    const newsContext = contextRequested && newsItems.length
      ? "\n\nCONTEXTE FACTUEL OPTIONNEL — actualités publiées sur le site. N'utilise une information que si elle répond directement à la demande:\n" +
        newsItems.map((n) => "- " + n.date + " — " + n.title + " : " + n.excerpt + " (" + SITE_ORIGIN + "/actualites/" + n.slug + ")").join("\n")
      : "";

    const mediaInstruction = [
      includeImage ? "prévoir une image affichée directement dans l'email" : "ne pas insérer d'image",
      includeVideo ? "prévoir une vidéo affichée en aperçu directement dans l'email" : "ne pas insérer de vidéo",
    ].join(" ; ");

    const systemPrompt = `Tu es le rédacteur éditorial d'AgriCapital SARL. Tu rédiges un email réellement destiné à un destinataire externe.

PRINCIPE ABSOLU :
- La demande de l'administrateur est la source principale.
- Comprends son intention avant d'écrire.
- Reste centré sur UNE idée principale.
- N'ajoute aucune information simplement pour remplir un modèle.
- N'utilise les actualités fournies que si elles sont directement pertinentes.
- Si une information n'est pas nécessaire ou n'est pas vérifiable, omets-la.
- Ne transforme jamais une instruction interne en phrase destinée au lecteur.

AUDIENCE : ${audience}.
${mediaInstruction}

RÈGLES ÉDITORIALES :
- Ton naturel, professionnel et humain, sans jargon marketing artificiel.
- Pas de répétition entre objet, titre, introduction, sections et conclusion.
- Pas de phrases génériques destinées à « faire joli ».
- Pas de promesse financière irréaliste, de prix, rendement, partenariat, chiffre, date, label, récompense ou témoignage inventé.
- Ne présente pas une plantation comme étant déjà en production commerciale si ce n'est pas établi.
- Ne mets pas une personne en avant sauf si la demande le demande explicitement.
- Les liens et médias sont gérés par le gabarit ; n'écris pas « voir ici », « cliquez ici » ou « voir la vidéo ».
- ${mediaInstruction}.
- Signature institutionnelle uniquement : L'équipe AgriCapital SARL.

SALUTATION — RÈGLE ABSOLUE :
- Utilise exactement le jeton interne {{greeting}} dans le champ greeting.
- Le moteur d'envoi remplacera ce jeton par « Bonjour Prénom Nom, » uniquement lorsqu'un nom est disponible.
- Lorsqu'aucun nom n'est disponible, le moteur remplacera {{greeting}} par une chaîne vide.
- INTERDICTION ABSOLUE d'écrire « Bonjour très cher », « Cher client », « Chère cliente », « Cher(e) », « cher lecteur », ou toute autre formule générique destinée à compenser l'absence de nom.
- Les mentions « {{prenom}} », « {{nom}} », « {{greeting}} », les règles ci-dessus et toute instruction destinée au développeur ou à l'IA ne doivent jamais apparaître dans l'email final.

CONTEXTE AgriCapital à utiliser seulement lorsque nécessaire : promoteur agricole ivoirien basé à Daloa, structuration et développement de projets agricoles, notamment autour du palmier à huile. Ne transforme pas ce contexte en paragraphe automatique.

STRUCTURE :
- La longueur dépend de la demande.
- sections, trustElements et CTA sont OPTIONNELS.
- Une seule section peut suffire.
- Aucun élément ne doit être créé uniquement parce qu'un champ existe.
- Si un CTA n'est pas utile, retourne null.
- Si une image ou vidéo n'est pas demandée, les suggestions restent vides.

Retourne uniquement un JSON valide :
{
  "name": "nom interne court",
  "subject": "objet fidèle à la demande, maximum 70 caractères",
  "preheader": "pré-header fidèle, maximum 120 caractères",
  "headline": "titre principal",
  "greeting": "{{greeting}}",
  "intro": "introduction utile et directement liée à la demande",
  "sections": [{"title":"titre","body":"contenu","bullets":["puce"]}],
  "trustElements": [],
  "cta": null,
  "closing": "conclusion utile ou chaîne vide si inutile",
  "signature": "L'équipe AgriCapital SARL",
  "plainText": "version texte brut réellement destinée au lecteur",
  "imageSuggestion": "",
  "videoSuggestion": ""
}
${newsContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt.slice(0, 5000) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Limite de requêtes atteinte." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    let parsed: any = {};
    try {
      parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || content || "{}");
    } catch (_e) {
      console.error("Campaign JSON parse failed, using fallback structure");
      parsed = {};
    }

    const campaign = normalizeCampaign(parsed, { prompt, audience, news: newsItems });
    const html = buildCampaignHtml(campaign, { includeImage, includeVideo });
    const mediaPreview = [
      ...(includeImage ? [{ type: "image", url: DEFAULT_IMAGE_URL, alt: campaign.imageSuggestion || "Plantation AgriCapital" }] : []),
      ...(includeVideo ? [{ type: "video", url: DEFAULT_VIDEO_URL, poster: DEFAULT_VIDEO_POSTER_URL, alt: campaign.videoSuggestion || "Vidéo terrain AgriCapital" }] : []),
    ];

    return new Response(JSON.stringify({
      ...campaign,
      html,
      imageUrl: includeImage ? DEFAULT_IMAGE_URL : "",
      videoUrl: includeVideo ? DEFAULT_VIDEO_URL : "",
      mediaPreview,
      plainText: campaign.plainText || stripHtml(html),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Campaign generation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur de génération" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

function buildCampaignHtml(data: any, media: { includeImage: boolean; includeVideo: boolean }): string {
  const sections = Array.isArray(data.sections) ? data.sections : [];
  const trust = Array.isArray(data.trustElements) ? data.trustElements : [];
  const sectionHtml = sections.map((s: any) => `
    <h2 style="color:#1A5C38;font-size:20px;margin:24px 0 10px;line-height:1.3;">${escapeHtml(s.title)}</h2>
    <p style="color:#2f3a34;font-size:15px;line-height:1.7;margin:0 0 12px;">${escapeHtml(s.body)}</p>
    ${Array.isArray(s.bullets) && s.bullets.length ? `<ul style="padding-left:22px;color:#2f3a34;font-size:15px;line-height:1.7;margin:8px 0 18px;">${s.bullets.map((b: string) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>` : ""}
  `).join("");

  const trustHtml = trust.length ? `<div style="background:#F7F3EA;border-left:4px solid #E8960A;padding:16px 18px;margin:22px 0;border-radius:8px;"><p style="margin:0 0 8px;color:#1A5C38;font-weight:700;">Éléments de confiance</p><ul style="margin:0;padding-left:20px;color:#2f3a34;font-size:14px;line-height:1.6;">${trust.map((item: string) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : "";
  const imageHtml = media.includeImage ? `<figure style="margin:24px 0;text-align:center;"><img src="${DEFAULT_IMAGE_URL}" alt="${escapeHtml(data.imageSuggestion || "Plantation AgriCapital")}" width="580" style="display:block;width:100%;max-width:580px;height:auto;margin:0 auto;border-radius:12px;border:0;outline:none;text-decoration:none;"><figcaption style="color:#66716b;font-size:12px;line-height:1.5;margin-top:8px;">${escapeHtml(data.imageSuggestion || "Aperçu terrain AgriCapital")}</figcaption></figure>` : "";
  const videoHtml = media.includeVideo ? `<div style="margin:24px 0;text-align:center;"><video controls muted playsinline preload="metadata" poster="${DEFAULT_VIDEO_POSTER_URL}" style="display:block;width:100%;max-width:580px;height:auto;margin:0 auto;border-radius:12px;border:1px solid #EAE4D5;"><source src="${DEFAULT_VIDEO_URL}" type="video/mp4"><img src="${DEFAULT_VIDEO_POSTER_URL}" alt="${escapeHtml(data.videoSuggestion || "Aperçu vidéo AgriCapital")}" width="580" style="display:block;width:100%;max-width:580px;height:auto;border-radius:12px;"></video><p style="color:#66716b;font-size:12px;line-height:1.5;margin:8px 0 0;">Aperçu vidéo terrain intégré.</p></div>` : "";
  const cta = data.cta || {};

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(data.preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:20px 0;"><tr><td align="center"><table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;"><tr><td style="background:#f3f4f6;padding:26px 28px;text-align:center;border-bottom:3px solid #1A5C38;"><img src="https://www.agricapital.ci/favicon.png" alt="AgriCapital" width="150" style="display:block;margin:0 auto 8px;max-width:150px;height:auto;"><p style="color:#ed7500;font-size:13px;margin:0;font-weight:700;">Investir la terre. Cultiver l'avenir.</p></td></tr><tr><td style="padding:30px;"><p style="color:#66716b;font-size:14px;margin:0 0 16px;">${data.greeting === "{{greeting}}" ? "{{greeting}}" : escapeHtml(data.greeting)}</p><h1 style="color:#14231b;font-size:28px;line-height:1.2;margin:0 0 16px;">${escapeHtml(data.headline)}</h1><p style="color:#2f3a34;font-size:16px;line-height:1.7;margin:0 0 18px;">${escapeHtml(data.intro)}</p>${imageHtml}${sectionHtml}${trustHtml}${videoHtml}${cta && (cta.label || cta.url) ? `<div style="text-align:center;margin:28px 0;"><p style="color:#2f3a34;font-size:15px;line-height:1.6;margin:0 0 14px;">${escapeHtml(cta.supportingText)}</p><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#E8960A;color:#ffffff;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:800;font-size:15px;">${escapeHtml(cta.label)}</a></div>` : ""}<p style="color:#2f3a34;font-size:15px;line-height:1.7;margin:22px 0;">${escapeHtml(data.closing)}</p><div style="border-top:2px solid #EAE4D5;margin-top:26px;padding-top:18px;color:#2f3a34;font-size:14px;line-height:1.6;"><p style="margin:0;font-weight:800;color:#14231b;">L'équipe AgriCapital SARL</p><p style="margin:8px 0 0;">🌐 www.agricapital.ci<br>📧 contact@agricapital.ci<br>📞 +225 05 64 55 17 17</p><p style="margin:8px 0 0;color:#E8960A;font-weight:700;">Investir la terre. Cultiver l'avenir.</p></div></td></tr></table></td></tr></table></body></html>`;
}
// Garantit qu'aucune campagne ne part vide ou tronquée, même si l'IA renvoie un JSON partiel.
function cleanGeneratedText(value: unknown): string {
  return String(value ?? "")
    .replace(/Bonjour\s*tr[eè]s\s+cher\s*,?/gi, "")
    .replace(/Cher\s*\(e\)\s*(client|cliente|lecteur|lectrice)?\s*,?/gi, "")
    .replace(/Ch[eè]re?\s+(client|cliente|lecteur|lectrice)\s*,?/gi, "")
    .replace(/si\s+le\s+(pr[eé]nom|nom).*?(utilisera|utiliser).*?(Bonjour|formule).*?(\.|$)/gi, "")
    .replace(/\{\{(?:prenom|nom)\}\}/gi, "")
    .replace(/\{\{greeting\}\}/gi, "")
    .replace(/(?:instruction|consigne)\s+(?:interne|pour\s+l['’]IA|pour\s+le\s+d[eé]veloppeur)[^.!?]*[.!?]?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeCampaign(
  raw: any,
  ctx: { prompt: string; audience: string; news: { title: string; excerpt: string; slug: string; date: string }[] },
) {
  const c = raw && typeof raw === "object" ? { ...raw } : {};
  const sections = Array.isArray(c.sections)
    ? c.sections.filter((x: any) => x && (x.title || x.body)).map((x: any) => ({
        title: cleanGeneratedText(x.title),
        body: cleanGeneratedText(x.body),
        bullets: Array.isArray(x.bullets) ? x.bullets.filter(Boolean).map(cleanGeneratedText).filter(Boolean) : [],
      })).filter((x: any) => x.title || x.body)
    : [];

  const cta = c.cta && typeof c.cta === "object" ? {
    label: cleanGeneratedText(c.cta.label),
    url: String(c.cta.url || ""),
    supportingText: cleanGeneratedText(c.cta.supportingText),
  } : null;

  const greeting = "{{greeting}}";
  const out = {
    name: cleanGeneratedText(c.name) || `Campagne AgriCapital — ${new Date().toLocaleDateString("fr-FR")}`,
    subject: cleanGeneratedText(c.subject).slice(0, 120) || cleanGeneratedText(ctx.prompt).slice(0, 70) || "AgriCapital",
    preheader: cleanGeneratedText(c.preheader).slice(0, 160),
    headline: cleanGeneratedText(c.headline) || cleanGeneratedText(c.subject) || "AgriCapital",
    greeting,
    intro: cleanGeneratedText(c.intro),
    sections,
    trustElements: Array.isArray(c.trustElements) ? c.trustElements.filter(Boolean).map(cleanGeneratedText).filter(Boolean) : [],
    cta: cta && (cta.label || cta.url || cta.supportingText) ? cta : null,
    closing: cleanGeneratedText(c.closing),
    signature: "L'équipe AgriCapital SARL",
    plainText: cleanGeneratedText(c.plainText),
    imageSuggestion: cleanGeneratedText(c.imageSuggestion),
    videoSuggestion: cleanGeneratedText(c.videoSuggestion),
  };

  if (!out.plainText) {
    const parts = [
      out.greeting,
      out.headline,
      out.intro,
      ...out.sections.flatMap((x: any) => [x.title, x.body, ...x.bullets]),
      out.closing,
      out.signature,
    ].filter(Boolean);
    out.plainText = parts.join("\n\n");
  }

  return out;
}
