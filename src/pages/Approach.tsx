import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ApproachSection from "@/components/Approach";

const Approach = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="Notre approche — AgriCapital" description="Découvrez le parcours de création et d'accompagnement d'une plantation AgriCapital." />
    <DynamicNavigation />
    <main className="pt-[72px]"><ApproachSection /></main>
    <Footer />
  </div>
);

export default Approach;
