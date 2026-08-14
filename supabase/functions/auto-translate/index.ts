import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANG_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  ar: "Arabic",
  es: "Spanish",
  de: "German",
  zh: "Chinese (Simplified)",
  bci: "Baoulé (Ivorian Baule, official Ivorian practical orthography: a b c d e ɛ f g gb h i j k kp l m n ny ŋ o ɔ p r s t u v w y z)",
  dyu: "Dioula / Julakan (Manding, official Latin orthography: a b c d e ɛ f g h i j k l m n ɲ ŋ o ɔ p r s t u w y z)",
};

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const buckets = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > MAX_PER_WINDOW;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { texts, targetLanguage, sourceLanguage = "fr" } = await req.json();
    if (!Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
      return new Response(JSON.stringify({ error: "texts[] and targetLanguage are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (targetLanguage === sourceLanguage) {
      return new Response(JSON.stringify({ translations: texts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!LANG_NAMES[targetLanguage]) {
      return new Response(JSON.stringify({ error: "Unsupported target language" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const items = texts.slice(0, 100).map((t: unknown) => String(t ?? "").slice(0, 5000));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are AgriCapital's professional localization engine. Translate each item faithfully, keeping the exact same meaning, tone, HTML tags, placeholders ({{x}}, %s) and ALL numbers, dates, units and currencies unchanged. Never translate brand names (AgriCapital, PalmInvest, TerraPalm, KAPITA, WhatsApp). Reply ONLY with a JSON object of the form {\"translations\": [\"...\"]} in the same order and with the same length as the input.",
          },
          {
            role: "user",
            content: `Source language: ${LANG_NAMES[sourceLanguage] || sourceLanguage}\nTarget language: ${LANG_NAMES[targetLanguage]}\n\nITEMS:\n${JSON.stringify(items)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`AI gateway failed [${res.status}]: ${body}`);
      return new Response(JSON.stringify({ error: "Translation failed", status: res.status, details: body }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : null;
    const translations = Array.isArray(parsed?.translations) ? parsed.translations : items;

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("auto-translate error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
