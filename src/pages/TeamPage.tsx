import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import TeamSection from "@/components/Team";

const TeamPage = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="Équipe & partenaires — AgriCapital" description="Découvrez l'équipe AgriCapital et son réseau de partenaires techniques et d'appui." />
    <DynamicNavigation />
    <main className="pt-[72px]"><TeamSection /></main>
    <Footer />
  </div>
);

export default TeamPage;
