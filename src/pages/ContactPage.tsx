import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ContactSection from "@/components/Contact";

const ContactPage = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="Contact — AgriCapital" description="Contactez AgriCapital à Daloa, Haut-Sassandra, Côte d'Ivoire." />
    <DynamicNavigation />
    <main className="pt-[72px]"><ContactSection /></main>
    <Footer />
  </div>
);

export default ContactPage;
