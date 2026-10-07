import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AboutSection from "@/components/About";

const About = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="À propos — AgriCapital" description="Découvrez AgriCapital, sa mission, sa vision et ses engagements." />
    <DynamicNavigation />
    <main className="pt-[72px]"><AboutSection /></main>
    <Footer />
  </div>
);

export default About;
