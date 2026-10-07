import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/translations";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string;
}

const BASE_URL = "https://www.agricapital.ci";
const languages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

const seoByLanguage: Record<Language, {
  title: string;
  description: string;
  keywords: string;
  locale: string;
}> = {
  fr: {
    title: "AgriCapital — Investir la terre. Cultiver l'avenir.",
    description: "AgriCapital accompagne la création, le développement et le suivi de plantations de palmier à huile en Côte d'Ivoire, avec une approche structurée et un accompagnement de terrain.",
    keywords: "AgriCapital, Côte d'Ivoire, Daloa, Gonaté, Haut-Sassandra, palmier à huile, plantation, agriculture, foncier, accompagnement agricole, PalmInvest, TerraPalm, PalmTerroir",
    locale: "fr_CI",
  },
  en: {
    title: "AgriCapital — Invest in land. Cultivate the future.",
    description: "AgriCapital supports the creation, development and monitoring of oil palm plantations in Côte d'Ivoire through a structured, field-based approach.",
    keywords: "AgriCapital, Côte d'Ivoire, Daloa, Gonaté, oil palm, plantation, agriculture, land, agricultural support, PalmInvest, TerraPalm, PalmTerroir",
    locale: "en_US",
  },
  ar: {
    title: "AgriCapital — الاستثمار في الأرض، وزراعة المستقبل",
    description: "تدعم AgriCapital إنشاء وتطوير ومتابعة مزارع نخيل الزيت في كوت ديفوار من خلال نهج منظم وميداني.",
    keywords: "AgriCapital, كوت ديفوار, دالوا, نخيل الزيت, الزراعة, المزارع",
    locale: "ar_SA",
  },
  es: {
    title: "AgriCapital — Invertir en la tierra. Cultivar el futuro.",
    description: "AgriCapital acompaña la creación, el desarrollo y el seguimiento de plantaciones de palma aceitera en Costa de Marfil.",
    keywords: "AgriCapital, Costa de Marfil, Daloa, palma aceitera, agricultura, plantaciones",
    locale: "es_ES",
  },
  de: {
    title: "AgriCapital — In Land investieren. Die Zukunft kultivieren.",
    description: "AgriCapital begleitet die Entwicklung und Betreuung von Ölpalmenplantagen in Côte d'Ivoire.",
    keywords: "AgriCapital, Côte d'Ivoire, Daloa, Ölpalme, Landwirtschaft, Plantagen",
    locale: "de_DE",
  },
  zh: {
    title: "AgriCapital — 投资土地，培育未来",
    description: "AgriCapital 在科特迪瓦支持油棕种植园的建设、发展和现场跟踪。",
    keywords: "AgriCapital, 科特迪瓦, 达洛阿, 油棕, 农业, 种植园",
    locale: "zh_CN",
  },
};

const upsertMeta = (attr: "name" | "property", key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
};

const upsertLink = (rel: string, href: string, extra?: { hreflang?: string }) => {
  const selector = extra?.hreflang
    ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (extra?.hreflang) el.hreflang = extra.hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
};

const cleanPath = (pathname: string) => {
  const value = pathname.replace(/^\/+|\/+$/g, "");
  if (!value) return "/";
  const parts = value.split("/");
  if (languages.includes(parts[0] as Language)) parts.shift();
  return "/" + parts.join("/");
};

const buildLocalizedUrl = (pathname: string, lang: Language) => {
  const path = cleanPath(pathname);
  // One canonical URL strategy: French uses the clean root path;
  // other languages use an explicit query parameter, including the homepage.
  return lang === "fr"
    ? `${BASE_URL}${path === "/" ? "" : path}`
    : `${BASE_URL}${path === "/" ? "" : path}?lang=${lang}`;
};

const SEOHead = ({ title, description, image, type = "website", keywords }: SEOHeadProps) => {
  const { language } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const seo = seoByLanguage[language] || seoByLanguage.fr;
    const finalTitle = title || seo.title;
    const finalDescription = description || seo.description;
    const finalKeywords = keywords || seo.keywords;
    const canonical = buildLocalizedUrl(location.pathname, language);
    const finalImage = image
      ? (image.startsWith("http") ? image : `${BASE_URL}${image.startsWith("/") ? image : "/" + image}`)
      : `${BASE_URL}/og-image.png`;

    document.title = finalTitle;

    upsertMeta("name", "description", finalDescription);
    upsertMeta("name", "keywords", finalKeywords);
    upsertMeta("name", "author", "AgriCapital");
    upsertMeta("name", "robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    upsertMeta("name", "content-language", language);
    upsertMeta("name", "geo.region", "CI-SC");
    upsertMeta("name", "geo.placename", "Daloa, Haut-Sassandra, Côte d'Ivoire");

    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", "AgriCapital");
    upsertMeta("property", "og:title", finalTitle);
    upsertMeta("property", "og:description", finalDescription);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:locale", seo.locale);
    upsertMeta("property", "og:image", finalImage);
    upsertMeta("property", "og:image:alt", finalTitle);
    upsertMeta("property", "og:image:width", "1200");
    upsertMeta("property", "og:image:height", "630");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", finalTitle);
    upsertMeta("name", "twitter:description", finalDescription);
    upsertMeta("name", "twitter:url", canonical);
    upsertMeta("name", "twitter:image", finalImage);

    upsertLink("canonical", canonical);

    languages.forEach((lang) => {
      upsertLink("alternate", buildLocalizedUrl(location.pathname, lang), { hreflang: lang === "fr" ? "fr-CI" : lang });
    });
    upsertLink("alternate", buildLocalizedUrl(location.pathname, "fr"), { hreflang: "x-default" });

    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language, location.pathname, title, description, image, type, keywords]);

  return null;
};

export default SEOHead;
