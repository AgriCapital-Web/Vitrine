import { ArrowRight, CheckCircle2, FileCheck2, LandPlot, Leaf, MapPinned, ShieldCheck, Sprout, Users } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import DynamicNavigation from "@/components/DynamicNavigation";
import Hero from "@/components/Hero";
import OffersSummary from "@/components/OffersSummary";
import NewsSection from "@/components/NewsSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import SEOJsonLD from "@/components/SEOJsonLD";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const sectionMap: Record<string, string> = {
  accueil:"hero", home:"hero", hero:"hero", "a-propos":"apropos", about:"apropos", apropos:"apropos",
  "notre-approche":"approche", approach:"approche", approche:"approche", impact:"impact", capacite:"impact",
  capacity:"impact", jalons:"evolution", milestones:"evolution", fondateur:"fondateur", founder:"fondateur",
  partenariat:"partenariat", partnership:"partenariat", temoignages:"temoignages", testimonials:"temoignages",
  contact:"contact", actualites:"actualites", news:"actualites", equipe:"equipe", team:"equipe",
  solutions:"offres", services:"offres", offres:"offres", offers:"offres", "comment-ca-marche":"approche", "how-it-works":"approche",
};
const supportedLanguages: Language[] = ["fr","en","ar","es","de","zh"];

const HomePage = () => {
  const { lang, section } = useParams();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const urlLang = parts[0] as Language;
    if (supportedLanguages.includes(urlLang) && language !== urlLang) {
      setLanguage(urlLang);
      localStorage.setItem("language", urlLang);
    }
  }, [location.pathname, language, setLanguage]);

  useEffect(() => {
    let target: string | undefined;
    if (section) target = sectionMap[section.toLowerCase()];
    if (!target) {
      const parts = location.pathname.split("/").filter(Boolean);
      const candidate = supportedLanguages.includes(parts[0] as Language) ? parts[1] : parts[0];
      if (candidate) target = sectionMap[candidate.toLowerCase()];
    }
    if (!target && location.hash) target = sectionMap[location.hash.replace("#","").toLowerCase()] || location.hash.replace("#","");
    if (!target) return;
    let attempts = 0;
    const scroll = () => {
      const el = document.getElementById(target || "");
      if (!el) return false;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 82, behavior:"smooth" });
      return true;
    };
    if (scroll()) return;
    const id = window.setInterval(() => { attempts += 1; if (scroll() || attempts > 20) window.clearInterval(id); }, 120);
    return () => window.clearInterval(id);
  }, [section, location.pathname, location.hash]);

  const isEn = language === "en";

  return (
    <div className="min-h-screen overflow-x-hidden bg-background" data-site-build="agricapital-modern-2026-10-03">
      <SEOHead />
      <SEOJsonLD />
      <DynamicNavigation />
      <Hero />

      <section className="site-section bg-background" id="apropos">
        <div className="site-container grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="site-eyebrow home-brand-eyebrow">AgriCapital</p>
            <h2 className="site-title home-intro-title text-foreground">
              {t.home.introTitle}
            </h2>
            <p className="site-lead">
              {t.home.introLead}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/solutions">Découvrir nos solutions <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/evolution">Voir notre évolution</Link></Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [ShieldCheck, t.home.cards[0].title, t.home.cards[0].desc],
              [Sprout, t.home.cards[1].title, t.home.cards[1].desc],
              [MapPinned, t.home.cards[2].title, t.home.cards[2].desc],
              [Users, t.home.cards[3].title, t.home.cards[3].desc],
            ].map(([Icon,title,text]) => {
              const I = Icon as typeof ShieldCheck;
              return <Card key={String(title)} className="modern-card"><CardContent className="p-6">
                <I className="mb-5 h-6 w-6 text-accent" />
                <h3 className="text-lg font-bold">{title as string}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text as string}</p>
              </CardContent></Card>;
            })}
          </div>
        </div>
      </section>

      <OffersSummary />

      <section className="site-section bg-secondary/45" id="impact">
        <div className="site-container">
          <div className="max-w-none">
            <p className="site-eyebrow">{t.home.capacityEyebrow}</p>
            <h2 className="site-title home-single-line-title">{t.home.capacityTitle}</h2>
            <p className="site-lead">{t.home.capacityLead}</p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["120 ha",t.impact.results.communities.desc],
              ["50 ha",t.impact.results.land.desc],
              ["500+ ha",t.impact.results.localities.desc],
              ["25 ans",t.impact.results.years.desc],
            ].map(([value,label]) => <div key={value} className="stat-strip p-6 md:p-7">
              <p className="text-3xl font-black tracking-tight text-primary md:text-4xl">{value}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{label}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section className="site-section" id="approche">
        <div className="site-container">
          <div className="max-w-none">
            <p className="site-eyebrow">{t.home.methodEyebrow}</p>
            <h2 className="site-title home-single-line-title">{t.home.methodTitle}</h2>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[
              ["01",t.home.methodSteps[0].title,t.home.methodSteps[0].desc],
              ["02",t.home.methodSteps[1].title,t.home.methodSteps[1].desc],
              ["03",t.home.methodSteps[2].title,t.home.methodSteps[2].desc],
              ["04",t.home.methodSteps[3].title,t.home.methodSteps[3].desc],
              ["05",t.home.methodSteps[4].title,t.home.methodSteps[4].desc],
            ].map(([n,title,text]) => <div key={n} className="relative rounded-2xl border border-border/70 bg-card p-6">
              <span className="text-xs font-black tracking-[.16em] text-accent">{n}</span>
              <h3 className="method-step-title mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section className="site-section bg-primary text-primary-foreground" id="evolution">
        <div className="site-container grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div>
            <p className="site-eyebrow !text-accent">Sur le terrain</p>
            <h2 className="site-title home-evolution-title !text-primary-foreground">{t.home.evolutionTitle}</h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/75">
              {t.home.evolutionLead}
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-7"><Link to="/evolution">Suivre notre évolution <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [FileCheck2,"Organisation","Des processus structurés."],
              [LandPlot,"Foncier","Des parcelles identifiées et sécurisées."],
              [Leaf,"Plantations","Une activité centrée sur le palmier à huile."],
              [CheckCircle2,"Terrain","Des opérations visibles et suivies."],
            ].map(([Icon,title,text]) => {
              const I = Icon as typeof FileCheck2;
              return <div key={String(title)} className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[.06] p-6">
                <I className="h-6 w-6 text-accent" />
                <h3 className="mt-5 font-bold">{title as string}</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/65">{text as string}</p>
              </div>;
            })}
          </div>
        </div>
      </section>

      <NewsSection />

      <section className="site-section bg-secondary/35" id="partenariat">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="site-eyebrow">Partenariats</p>
            <h2 className="site-title">{t.home.partnershipTitle}</h2>
            <p className="site-lead">{t.home.partnershipLead}</p>
          </div>
          <Button asChild size="lg"><Link to="/partenariats">Découvrir les partenariats <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </section>

      <Contact />
      <Footer />
    </div>
  );
};

export default HomePage;
