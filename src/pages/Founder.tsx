import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FounderSection from "@/components/Founder";

const Founder = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Inocent KOFFI | Fondateur et Gérant d’AgriCapital SARL"
      description="Découvrez Inocent KOFFI, fondateur et gérant d’AgriCapital SARL, son parcours entrepreneurial et sa vision du développement agricole, du patrimoine foncier et des plantations de palmier à huile en Côte d’Ivoire."
      keywords="Inocent KOFFI, fondateur AgriCapital, gérant AgriCapital SARL, entrepreneur agricole ivoirien, investissement agricole, patrimoine agricole, actifs réels, foncier agricole, palmier à huile, plantation clé en main, Côte d’Ivoire, ikoffi.agricapital.ci"
    />
    <DynamicNavigation />
    <main className="pt-[72px]"><FounderSection /></main>
    <Footer />
  </div>
);

export default Founder;
