import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FounderSection from "@/components/Founder";

const Founder = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="AgriCapital | Présentation de l’entreprise"
      description="AgriCapital structure des projets agricoles autour du foncier, du développement de plantations et du suivi dans la durée en Côte d’Ivoire."
      keywords="Inocent KOFFI, fondateur AgriCapital, gérant AgriCapital SARL, entrepreneur agricole ivoirien, investissement agricole, patrimoine agricole, actifs réels, foncier agricole, palmier à huile, plantation clé en main, Côte d’Ivoire"
    />
    <DynamicNavigation />
    <main className="pt-[72px]"><FounderSection /></main>
    <Footer />
  </div>
);

export default Founder;
