import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ImpactSection from "@/components/Impact";
import PublicPageHero from "@/components/PublicPageHero";
import { useLanguage } from "@/contexts/LanguageContext";

const Capacity = () => {
  const { t } = useLanguage();
  return (
  <div className="min-h-screen bg-background">
    <SEOHead title="Notre capacité opérationnelle — AgriCapital" description="Les moyens, le foncier identifié et la capacité opérationnelle d'AgriCapital." />
    <DynamicNavigation />
    <main className="pt-[72px]"><PublicPageHero title={t.impact.title} description={t.impact.subtitle} image="/terrain/pepiniere-plants.webp" imageAlt="Plants de palmier à huile de la pépinière AgriCapital" /><ImpactSection /></main>
    <Footer />
  </div>
);
};

export default Capacity;
