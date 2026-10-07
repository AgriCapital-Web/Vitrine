import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifyAdmin(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = data.claims.sub as string;

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: roleData } = await adminClient
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "admin").single();

  if (!roleData) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return { userId };
}

// Rate limiting: max 20 article generations per admin per hour
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(userId);
  if (!entry || now > entry.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Admin auth check
  const authResult = await verifyAdmin(req);
  if (authResult instanceof Response) return authResult;

  // Rate limit check
  if (!checkRateLimit(authResult.userId)) {
    return new Response(JSON.stringify({ error: "Limite atteinte : 20 articles/heure. Réessayez plus tard." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { rawInput, mediaOption = "auto", editorialMode = "reportage", sourceImages = [] } = await req.json();
    const normalizedImages = Array.isArray(sourceImages)
      ? sourceImages.filter((url: unknown) => typeof url === "string" && /^https?:\/\//i.test(url)).slice(0, 12)
      : [];

    if (!rawInput || typeof rawInput !== "string" || rawInput.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Un texte ou une idée est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit input length
    const sanitizedInput = rawInput.slice(0, 5000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const modeInstruction = {
      flash: "BRÈVE : 350 à 600 mots, utile pour une information courte et factuelle.",
      standard: "ARTICLE : 800 à 1 200 mots, avec une vraie progression éditoriale et 3 à 5 sous-parties si la matière le justifie.",
      immersive: "GRAND FORMAT : 1 200 à 1 800 mots, narration plus travaillée, analyse du contexte et respiration visuelle. Aucun remplissage.",
      reportage: "REPORTAGE : 1 000 à 1 600 mots. Donner une impression de terrain, une progression claire et institutionnelle, sans inventer de scènes ou de témoignages.",
    }[editorialMode] || "ARTICLE : 800 à 1 200 mots.";

    const mediaInstruction = `
MEDIA :
- Il y a ${normalizedImages.length} image(s) importée(s) par l'utilisateur.
- Analyse CHAQUE image importée : sujet, lieu apparent, personnes, activité, cadrage, éléments agricoles, logos éventuels et cohérence avec les paragraphes.
- Ne force jamais une image dans l'article. Une image ne doit apparaître que si elle apporte une information ou une respiration éditoriale.
- Quand une image importée est pertinente, place exactement un marqueur [[IMAGE_1]], [[IMAGE_2]], etc. dans le corps du texte.
- Si une image est uniquement adaptée à la couverture, ne la répète pas dans le corps.
- Si plusieurs images racontent la même scène, n'en mets qu'une dans le corps.
- Si les images disponibles sont insuffisantes, propose uniquement les visuels réellement nécessaires dans imagePrompts. Pour chaque prompt généré, utilise dans le texte le marqueur [[AI_IMAGE_1]], [[AI_IMAGE_2]], etc., dans le même ordre que imagePrompts.
- Si mediaOption vaut "text-only", imagePrompts doit être [] et aucun marqueur IMAGE ne doit être utilisé.
`;

    const systemPrompt = `Tu es le rédacteur en chef du newsroom officiel d'AgriCapital SARL, une entreprise ivoirienne spécialisée dans le développement de plantations de palmier à huile et la structuration de projets agricoles.

OBJECTIF :
Créer de véritables publications éditoriales : des textes assez développés pour informer, expliquer et donner du relief au sujet. Le résultat doit avoir le niveau d'un média institutionnel moderne, sans copier un autre site.

${modeInstruction}

IDENTITÉ ÉDITORIALE AGRICAPITAL :
- Ton : professionnel, sérieux, humain, précis, africain et institutionnel.
- Écriture : claire, vivante, fluide, avec des phrases de longueur variée.
- Le texte doit expliquer le quoi, le pourquoi, le contexte et les implications lorsque ces éléments sont présents dans la matière fournie.
- Ne transforme pas chaque article en publicité. AgriCapital peut informer, analyser, documenter une opération ou raconter une évolution.
- Évite les répétitions et les formules génériques.
- Utilise des sous-titres seulement lorsqu'ils améliorent réellement la lecture.
- Ne mets pas le titre entièrement en MAJUSCULES.
- Le titre doit être précis, mémorisable et fidèle au sujet.
- L'extrait doit donner envie de lire sans répéter le titre.

RÈGLES DE FIABILITÉ :
- N'invente jamais de chiffre, date, lieu, personne, citation, événement, partenariat, résultat ou promesse qui n'est pas fourni ou clairement établi.
- Tu peux analyser et mettre en perspective les faits fournis, mais une analyse ne doit jamais être présentée comme un fait.
- Si la matière est trop courte pour affirmer un détail, ne l'invente pas.
- Ne présente jamais AgriCapital comme une banque, une ONG ou un fonds.
- Utilise le vocabulaire : particuliers et professionnels, propriétaires fonciers, patrimoine agricole, plantation clé en main, sécurisation foncière, suivi technique et traçabilité.

STRUCTURE JSON :
{
  "title": "Titre éditorial",
  "content": "Article complet en Markdown avec les marqueurs [[IMAGE_1]] quand nécessaire",
  "excerpt": "Extrait de 1 à 3 phrases",
  "hashtags": ["agriculture", "Côte d'Ivoire"],
  "category": "actualites",
  "slug": "titre-url-friendly",
  "imagePrompts": [],
  "videoPrompt": "",
  "mediaPlan": [
    {"sourceIndex": 0, "role": "cover", "caption": "Légende courte", "alt": "Description accessible"},
    {"sourceIndex": 1, "role": "inline", "marker": "[[IMAGE_2]]", "caption": "Légende courte", "alt": "Description accessible"}
  ]
}

${mediaInstruction}`;

    const userText = `Matière éditoriale fournie par l'utilisateur :
${sanitizedInput}

Analyse maintenant le texte et, si des images sont fournies, analyse-les une par une avant de construire l'article.`;
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              ...normalizedImages.map((url: string) => ({
                type: "image_url",
                image_url: { url },
              })),
            ],
          },
        ],      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    const parseAIJson = (text: string) => {
      try {
        return JSON.parse(text);
      } catch {
        const fenced = text.match(/```json\s*([\s\S]*?)```/i)?.[1] || text.match(/```\s*([\s\S]*?)```/i)?.[1] || text;
        const objectLike = fenced.match(/\{[\s\S]*\}/)?.[0];
        if (!objectLike) throw new Error("Failed to parse AI response as JSON");
        return JSON.parse(objectLike);
      }
    };

    const article = parseAIJson(rawContent);

    const contentCaps: Record<string, number> = { flash: 4500, standard: 9000, immersive: 14000, reportage: 12000 };
    const cap = contentCaps[editorialMode] || 3500;
    if (typeof article.content === "string" && article.content.length > cap) {
      const paragraphs = article.content.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean);
      let total = 0;
      const kept: string[] = [];
      for (const paragraph of paragraphs) {
        if (total + paragraph.length + 2 > cap) break;
        kept.push(paragraph);
        total += paragraph.length + 2;
      }
      article.content = kept.join("\n\n") || article.content.slice(0, cap);
    }
    if (Array.isArray(article.imagePrompts)) article.imagePrompts = article.imagePrompts.slice(0, 4);
    if (Array.isArray(article.mediaPlan)) article.mediaPlan = article.mediaPlan.slice(0, normalizedImages.length);

    if (!article?.title || !article?.content) {
      throw new Error("Réponse IA incomplète");
    }

    return new Response(JSON.stringify(article), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate article error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Erreur lors de la génération",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
