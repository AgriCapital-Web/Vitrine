import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ApproachSection from "@/components/Approach";
import PublicPageHero from "@/components/PublicPageHero";
import { useLanguage } from "@/contexts/LanguageContext";

const Approach = () => {
  const { t } = useLanguage();
  return (
  <div className="min-h-screen bg-background">
    <SEOHead title="Notre approche — AgriCapital" description="Découvrez le parcours de création et d'accompagnement d'une plantation AgriCapital." />
    <DynamicNavigation />
    <main className="pt-[72px]"><PublicPageHero title={t.approach.title} description={t.approach.subtitle} image="/terrain/suivi-technique.webp" imageAlt="Suivi technique des plantations AgriCapital" /><ApproachSection /></main>
    <Footer />
  </div>
);
};

export default Approach;
