import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DynamicNavigation from "@/components/DynamicNavigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, MapPin, Globe, ArrowRight, Sprout, HandHeart, Leaf } from "lucide-react";
import heroAsset from "@/assets/palm-mature-plantation.jpg";

const OFFRES = [
  "Valorisation foncière et accès sécurisé",
  "Construction d’un patrimoine agricole durable",
  "Création et mise en place de la plantation",
  "Facilitation de l’écoulement de la production",
  "Suivi technique et agronomique",
  "Plantation développée et remise prête à produire",
];

const Solutions = () => {
  const { t } = useLanguage();
  const included = Array.from(new Set([...t.offers.palmInvest.features, ...t.offers.terraPalm.features, ...t.offers.palmTerroir.features]));
  return (
    <div className="public-page min-h-screen">
      <Helmet>
        <title>Solutions & Services — AgriCapital</title>
        <meta
          name="description"
          content="Avec ou sans foncier, AgriCapital propose des solutions structurées pour créer, développer et accompagner des plantations de palmier à huile."
        />
        <link rel="canonical" href="https://agricapital.ci/solutions" />
      </Helmet>

      <DynamicNavigation />

      <main className="pt-[72px] pb-10">
        <section className="public-page-header"><div className="public-page-header-inner">
          <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-8 xl:gap-14 items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[clamp(2.6rem,4vw,4.35rem)] font-extrabold leading-[1.02] tracking-[-.045em] mb-5">
                <span className="text-primary block">{t.offers.title}</span>
                <span className="text-primary block">{t.home.introTitle}</span>
                <span className="text-[#ed7500] block">{t.offers.subtitle}</span>
              </h1>
              <p className="text-base md:text-lg xl:text-xl text-foreground/80 leading-[1.7] max-w-2xl">
                {t.home.introLead}
              </p>
            </div>
            <div className="relative order-first lg:order-last">
              <img
                src={heroAsset}
                alt="Plantation de palmier à huile — AgriCapital"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full h-auto min-h-[320px] sm:min-h-[420px] lg:min-h-[540px] object-contain rounded-2xl bg-muted/20 shadow-medium mx-auto"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = heroAsset; }}
              />
            </div>
          </div>
        </div></section>

        <div className="site-container mb-8 lg:mb-10">
          <p className="site-eyebrow">{t.offers.title}</p>
          <h2 className="site-title text-2xl sm:text-3xl md:text-4xl">{t.offers.subtitle}</h2>
        </div>

        <section className="container mx-auto px-4 md:px-6 mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            <Card className="modern-card overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <HandHeart className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-primary">{t.offers.forSubscribers}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.offers.withoutLandQuestion}</p>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">PalmInvest</h3>
                <p className="text-sm md:text-base text-foreground/85 leading-relaxed">
                  {t.offers.palmInvest.desc}
                </p>
                <Button asChild className="mt-6">
                  <Link to="/palminvest">
                    {t.offers.cta} PalmInvest <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="modern-card overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#ed7500] text-white flex items-center justify-center shrink-0">
                    <Sprout className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#ed7500]">Avec votre foncier</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.offers.withLandQuestion}</p>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">TerraPalm</h3>
                <p className="text-sm md:text-base text-foreground/85 leading-relaxed">
                  {t.offers.terraPalm.desc}
                </p>
                <Button asChild className="mt-6 bg-[#ed7500] hover:bg-[#ed7500]/90 text-white">
                  <Link to="/terrapalm">
                    {t.offers.cta} TerraPalm <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="modern-card overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Leaf className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-primary">{t.offers.palmTerroirTag}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.offers.palmTerroirQuestion}</p>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">PalmTerroir</h3>
                <p className="text-sm md:text-base text-foreground/85 leading-relaxed">
                  {t.offers.palmTerroir.desc}
                </p>
                <Button asChild className="mt-6" variant="outline">
                  <Link to="/palmterroir">
                    {t.offers.cta} PalmTerroir <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6 mb-14">
          <Card className="border-2 border-primary/40 bg-primary/5">
            <CardContent className="p-6 md:p-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-primary uppercase tracking-wide mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <HandHeart className="w-5 h-5" />
                </span>
                {t.offers.title}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-foreground/90 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="container mx-auto px-4 md:px-6 mb-14">
          <div className="max-w-4xl">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-[#ed7500] underline underline-offset-4 mb-4">
              {t.home.clientPortalTitle}
            </h2>
            <p className="text-sm md:text-base text-foreground/85 leading-relaxed font-medium">
              {t.home.clientPortalDesc}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6">
          <div className="rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 grid gap-4 md:grid-cols-2 items-center">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-[#ed7500] shrink-0" />
              <p className="text-sm md:text-base font-semibold">Gonaté – Daloa | 6J/7 – 08h à 18h</p>
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <Globe className="w-6 h-6 text-[#ed7500] shrink-0" />
              <p className="text-sm md:text-base font-semibold">
                Portail client :{" "}
                <a href="https://client.agricapital.ci" className="underline">client.agricapital.ci</a>
              </p>
            </div>
          </div>
          <p className="text-center text-primary text-xl md:text-2xl lg:text-3xl font-extrabold mt-8">
            Investir la terre. Cultiver l'avenir.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button asChild size="lg">
              <Link to="/contact">Prendre contact <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/partenariats">Découvrir les partenariats</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Solutions;
