import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import ContactCTA, { contactCtaLabel } from "@/components/ContactCTA";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

import slide1 from "@/assets/nursery-pepiniere-daloa.jpg";
import slide2 from "@/assets/founder-palm-field.jpg";
import slide3 from "@/assets/palm-mature-plantation.jpg";

interface Slide {
  image: string;
  eyebrow: Record<Language, string>;
  title: Record<Language, string>;
  description: Record<Language, string>;
}

const slides: Slide[] = [
  {
    image: slide1,
    eyebrow: { fr: "Notre savoir-faire", en: "Our expertise", ar: "خبرتنا", es: "Nuestra experiencia", de: "Unser Know-how", zh: "我们的专长" },
    title: {
      fr: "Bâtissons votre patrimoine agricole durable",
      en: "Building your sustainable agricultural heritage",
      ar: "نبني إرثكم الزراعي المستدام",
      es: "Construyamos su patrimonio agrícola sostenible",
      de: "Wir bauen Ihr nachhaltiges Agrarvermögen auf",
      zh: "共建您可持续的农业资产",
    },
    description: {
      fr: "AgriCapital accompagne particuliers et entreprises dans la création de plantations professionnelles de palmier à huile dans le Haut-Sassandra et partout en Côte d'Ivoire.",
      en: "AgriCapital supports individuals and businesses in creating professional oil palm plantations in Côte d'Ivoire.",
      ar: "تساعد AgriCapital الأفراد والشركات على إنشاء مزارع نخيل زيت احترافية في كوت ديفوار.",
      es: "AgriCapital acompaña a particulares y empresas en la creación de plantaciones profesionales de palma aceitera en Costa de Marfil.",
      de: "AgriCapital begleitet Privatpersonen und Unternehmen beim Aufbau professioneller Ölpalmplantagen in der Elfenbeinküste.",
      zh: "AgriCapital助力个人与企业在科特迪瓦建立专业油棕种植园。",
    },
  },
  {
    image: slide2,
    eyebrow: { fr: "Valorisation du foncier", en: "Land securing", ar: "تأمين الأراضي", es: "Aseguramiento de tierras", de: "Landsicherung", zh: "土地保障" },
    title: {
      fr: "Vous avez la terre ? Nous la transformons en plantation productive",
      en: "You have the land? We turn it into a productive plantation",
      ar: "لديكم الأرض؟ نحوّلها إلى مزرعة منتجة",
      es: "¿Tiene tierras? Las convertimos en una plantación productiva",
      de: "Sie haben das Land? Wir machen daraus eine produktive Plantage",
      zh: "您拥有土地？我们将其转化为高产种植园",
    },
    description: {
      fr: "Préparation du terrain, piquetage, plantation et fertilisation — nous accompagnons la mise en place de la plantation selon les caractéristiques du projet.",
      en: "Agro-pedological studies, clearing, staking, planting and fertilisation — we handle the full development.",
      ar: "دراسات زراعية، إزالة، تخطيط، زراعة وتسميد — نتولى كامل التطوير.",
      es: "Estudios agropedológicos, desmonte, replanteo, plantación y fertilización — gestionamos todo el desarrollo.",
      de: "Bodenanalysen, Rodung, Vermessung, Pflanzung und Düngung — wir übernehmen die gesamte Entwicklung.",
      zh: "土壤研究、清理、放线、种植与施肥——我们负责全程开发。",
    },
  },
  {
    image: slide3,
    eyebrow: { fr: "Accompagnement intégral", en: "Full support", ar: "مرافقة كاملة", es: "Acompañamiento integral", de: "Komplette Begleitung", zh: "全程陪伴" },
    title: {
      fr: "Pas de terre ? Nous nous occupons de tout, jusqu'à l'exploitation",
      en: "No land? We handle everything, all the way to operations",
      ar: "لا تملك أرضًا؟ نتولى كل شيء حتى التشغيل",
      es: "¿Sin tierras? Nos encargamos de todo, hasta la explotación",
      de: "Kein Land? Wir kümmern uns um alles bis zur Bewirtschaftung",
      zh: "没有土地？从筹备到运营，我们全权负责",
    },
    description: {
      fr: "AgriCapital sécurise le foncier et crée pour vous une plantation de palmier à huile productive et durable. Un actif agricole clé en main.",
      en: "Land identification, legal securing, cultivation and technical support throughout the contract.",
      ar: "تحديد الأراضي، التأمين القانوني، الزراعة والدعم الفني طوال مدة العقد.",
      es: "Identificación, seguridad jurídica, cultivo y soporte técnico durante todo el contrato.",
      de: "Landidentifikation, Rechtssicherheit, Anbau und technische Unterstützung über die gesamte Vertragslaufzeit.",
      zh: "土地识别、法律保障、种植与全程技术支持。",
    },
  },
];

// Texte multilingue simplifié (fr + en, en par défaut pour les autres locales)
const L = (fr: string, en: string): Record<Language, string> => ({ fr, en, ar: en, es: en, de: en, zh: en });

// Inauguration du Bureau de Proximité de Gonaté + 1re session de formation du réseau commercial
const eventSlides: Slide[] = [
  {
    image: "/inauguration/bureau-gonate-enseigne.webp",
    eyebrow: L("Bureau de proximité", "Local office"),
    title: L("Notre premier Bureau de Proximité est ouvert à Gonaté", "Our first local office is open in Gonaté"),
    description: L(
      "Un guichet dédié à l'information, l'accompagnement et la contractualisation, au plus près des propriétaires fonciers et des souscripteurs.",
      "A dedicated desk for information, support and contracting, close to landowners and subscribers.",
    ),
  },
  {
    image: "/inauguration/inauguration-assemblee.webp",
    eyebrow: L("Inauguration", "Inauguration"),
    title: L("Une ouverture officielle en présence de nos partenaires", "An official opening with our partners"),
    description: L(
      "Autorités locales, propriétaires fonciers, partenaires techniques et clients réunis autour du modèle AgriCapital.",
      "Local authorities, landowners, technical partners and clients gathered around the AgriCapital model.",
    ),
  },
  {
    image: "/inauguration/inauguration-prise-parole.webp",
    eyebrow: L("Vision & modèle", "Vision & model"),
    title: L("Un modèle de création et de gestion d'actifs agricoles", "A model for creating and managing agricultural assets"),
    description: L(
      "Sécurisation foncière, développement de la plantation et suivi technique sur toute la durée du contrat.",
      "Land securing, plantation development and technical monitoring throughout the contract.",
    ),
  },
  {
    image: "/inauguration/inauguration-groupe.webp",
    eyebrow: L("Nos équipes", "Our teams"),
    title: L("Une organisation structurée et ancrée sur le terrain", "A structured organisation rooted in the field"),
    description: L(
      "AgriCapital construit progressivement une organisation solide, capable d'accompagner durablement ses partenaires.",
      "AgriCapital is progressively building a solid organisation able to support its partners over the long term.",
    ),
  },
  {
    image: "/formation/formation-groupe-cohorte.webp",
    eyebrow: L("Réseau commercial", "Sales network"),
    title: L("11 conseillers commerciaux rejoignent AgriCapital", "11 sales advisors join AgriCapital"),
    description: L(
      "Première session d'intégration et de formation du réseau commercial : histoire, vision, offres et exigences de l'entreprise.",
      "First onboarding and training session for our sales network: history, vision, offers and standards.",
    ),
  },
  {
    image: "/formation/formation-prise-parole.webp",
    eyebrow: L("Formation", "Training"),
    title: L("Des équipes formées, engagées et alignées", "Trained, committed and aligned teams"),
    description: L(
      "Le développement d'une entreprise durable repose autant sur ses équipes que sur son modèle économique.",
      "Building a sustainable company relies as much on its teams as on its business model.",
    ),
  },
  {
    image: "/formation/formation-presentation-offres.webp",
    eyebrow: L("Nos solutions", "Our solutions"),
    title: L("PalmInvest & TerraPalm : deux voies vers un patrimoine agricole", "PalmInvest & TerraPalm: two paths to agricultural wealth"),
    description: L(
      "Que vous possédiez une terre ou non, AgriCapital développe et gère votre plantation de palmier à huile clé en main.",
      "Whether you own land or not, AgriCapital develops and manages your turnkey oil palm plantation.",
    ),
  },
];

const allSlides: Slide[] = [...slides, ...eventSlides];

const dbFieldSlide = (url: string, name: string): Slide => ({
  image: url,
  eyebrow: L("Sur le terrain", "On the ground"),
  title: L(name, name),
  description: L(
    "Une image réelle du déploiement opérationnel d'AgriCapital sur le terrain.",
    "A real view of AgriCapital's operational deployment in the field.",
  ),
});

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Hero = () => {
  const { language } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState<Slide[]>(() => allSlides);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_media")
      .select("url,name")
      .eq("category", "hero-terrain")
      .eq("type", "image")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (cancelled || !data?.length) return;
        const valid = data
          .filter((item) => typeof item.url === "string" && /^(https?:\/\/|\/)/.test(item.url))
          .map((item) => dbFieldSlide(item.url, item.name || "AgriCapital — Sur le terrain"));
        if (!valid.length) return;
        const seen = new Set<string>();
        const merged = [...allSlides, ...valid].filter((slide) => {
          if (!slide.image || seen.has(slide.image)) return false;
          seen.add(slide.image);
          return true;
        });
        setSlides(merged);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 6500);
    return () => clearInterval(id);
  }, [next, isPaused]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const slide = slides[current];
  const t = (rec: Record<Language, string>) => rec[language] || rec.fr;

  return (
    <section id="hero" className="pt-[72px] bg-background" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="hero-stage relative overflow-hidden bg-cinema text-cinema-foreground">
        {slides.map((s, i) => <div key={i} aria-hidden={current !== i} className={`absolute inset-0 transition-opacity duration-1000 ${current === i ? "opacity-100" : "opacity-0"}`}>
          <img src={s.image} alt={t(s.title)} className={`absolute inset-0 h-full w-full object-cover hero-slide-image ${current === i ? "hero-slide-image-active" : ""}`} loading={i === 0 ? "eager" : "lazy"} />
        </div>)}
        <div className="absolute inset-0 hero-shade" />
        <div className="site-container relative flex min-h-[530px] h-full flex-col justify-end py-8 sm:py-12">
          <div key={current} className="hero-content-active">
            <p className="mb-4 flex items-center gap-3 text-sm font-bold"><span className="h-0.5 w-8 bg-accent" />AgriCapital — {t(slide.eyebrow)}</p>
            <h1 className="hero-title">{t(slide.title)}</h1>
            <p className="hero-copy mt-4 text-cinema-foreground/90">{t(slide.description)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ContactCTA><Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">{contactCtaLabel(language)}<ArrowRight /></Button></ContactCTA>
              <Button size="lg" onClick={() => scrollToSection("contact")} variant="outline" className="article-film-button">{language === "en" ? "Contact us" : "Nous contacter"}</Button>
            </div>
          </div>
          <div className="mt-7 flex items-center justify-between gap-4 border-t border-cinema-foreground/30 pt-4">
            <span className="text-xs font-semibold">{String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
            <div className="flex gap-2"><Button variant="outline" size="icon" className="article-film-button" onClick={prev} aria-label="Image précédente"><ChevronLeft /></Button><Button variant="outline" size="icon" className="article-film-button" onClick={next} aria-label="Image suivante"><ChevronRight /></Button></div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5"><div key={current} className="hero-progress-bar" /></div>
      </div>
      <div className="site-container grid gap-0 sm:grid-cols-2 py-6 sm:py-8">
        {[
          { title: "Le trésor caché du foncier agricole", text: "Comprendre le potentiel d’un patrimoine productif et transmissible.", href: "/tresor-foncier" },
          { title: "Le trésor caché du palmier à huile", text: "Un arbre stratégique, au cœur du potentiel agricole ivoirien.", href: "/tresor-palmier" },
        ].map((item,i) => <Link key={item.href} to={item.href} className={`group py-4 ${i ? "sm:border-l sm:border-border sm:pl-8" : "sm:pr-8"}`}>
          <p className="text-xs font-bold text-primary mb-2">Bref investisseur</p>
          <h2 className="hero-brief-title font-bold flex items-start justify-between gap-4">{item.title}<ArrowRight className="h-5 w-5 shrink-0 text-accent transition-transform group-hover:translate-x-1" /></h2>
          <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
        </Link>)}
      </div>
    </section>
  );
};

export default Hero;
