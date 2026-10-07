import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FounderSection from "@/components/Founder";

const Founder = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="Direction & vision fondatrice — AgriCapital" description="Découvrez la direction et la vision fondatrice d'AgriCapital." />
    <DynamicNavigation />
    <main className="pt-[72px]"><FounderSection /></main>
    <Footer />
  </div>
);

export default Founder;
