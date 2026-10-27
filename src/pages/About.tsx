import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AboutSection from "@/components/About";
import PublicPageHero from "@/components/PublicPageHero";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  return (
  <div className="min-h-screen bg-background">
    <SEOHead title="À propos — AgriCapital" description="Découvrez AgriCapital, sa mission, sa vision et ses engagements." />
    <DynamicNavigation />
    <main className="pt-[72px]"><PublicPageHero title="AgriCapital" description={t.about.history.subtitle} image="/terrain/visite-parcelle.webp" imageAlt="Équipe AgriCapital sur le terrain" /><AboutSection /></main>
    <Footer />
  </div>
);
};

export default About;
