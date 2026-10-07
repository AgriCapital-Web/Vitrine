import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ImpactSection from "@/components/Impact";

const Capacity = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="Notre capacité opérationnelle — AgriCapital" description="Les moyens, le foncier identifié et la capacité opérationnelle d'AgriCapital." />
    <DynamicNavigation />
    <main className="pt-[72px]"><ImpactSection /></main>
    <Footer />
  </div>
);

export default Capacity;
