import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DynamicNavigation from "@/components/DynamicNavigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, MapPin, Globe, ArrowRight, Sprout, HandHeart, Leaf } from "lucide-react";
import heroAsset from "@/assets/palm-mature-plantation.jpg";
import PublicPageHero from "@/components/PublicPageHero";

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
          content="Avec ou sans terre, AgriCapital accompagne les projets de plantation de palmier à huile clé en main en Côte d’Ivoire, dans un cadre clair, transparent et suivi."
        />
        <meta name="keywords" content="solutions agricoles, services agricoles, investissement agricole, plantation clé en main, palmier à huile, patrimoine agricole, actifs réels, foncier agricole, PalmInvest, PalmTerroir, TerraPalm, AgriCapital, Inocent KOFFI, Côte d’Ivoire" />
        <meta property="og:title" content="Solutions agricoles & plantation clé en main | AgriCapital" />
        <meta property="og:description" content="Découvrez les solutions AgriCapital pour une plantation de palmier à huile clé en main, avec ou sans terre, avec des engagements clairs et un suivi documenté." />
        <link rel="canonical" href="https://www.agricapital.ci/solutions" />
      </Helmet>

      <DynamicNavigation />

      <main className="pt-[72px] pb-10">
        <PublicPageHero title={t.offers.title} description={t.offers.subtitle} image={heroAsset} imageAlt="Plantation de palmier à huile AgriCapital" />

        <div className="site-container mt-10 mb-8 lg:mb-10">
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
                  <div className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                    <Sprout className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-accent">Avec votre foncier</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.offers.withLandQuestion}</p>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">TerraPalm</h3>
                <p className="text-sm md:text-base text-foreground/85 leading-relaxed">
                  {t.offers.terraPalm.desc}
                </p>
                <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
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
          <div className="border-y border-border bg-secondary/40">
            <div className="py-8">
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
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6 mb-14">
          <div className="border-t border-border">
            <div className="py-8">
              <div className="max-w-4xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-3">Notre engagement</p>
                <h2 className="text-xl md:text-2xl font-extrabold text-primary mb-3">La transparence, à chaque étape du projet</h2>
                <p className="text-sm md:text-base text-foreground/85 leading-relaxed">
                  Notre démarche s’appuie sur des éléments fonciers documentés, des étapes contractuelles claires et un suivi de l’évolution de la plantation. Les engagements et les modalités sont présentés selon l’offre retenue, afin que chaque client comprenne le cadre du projet, les étapes prévues et les points de suivi — sans promesse de rendement garanti.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6 mb-14">
          <div className="max-w-4xl">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-accent underline underline-offset-4 mb-4">
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
              <MapPin className="w-6 h-6 text-accent shrink-0" />
              <p className="text-sm md:text-base font-semibold">Gonaté – Daloa | 6J/7 – 08h à 18h</p>
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <Globe className="w-6 h-6 text-accent shrink-0" />
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
