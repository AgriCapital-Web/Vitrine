import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ContactSection from "@/components/Contact";

const ContactPage = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Contact AgriCapital | Investissement agricole en Côte d’Ivoire"
      description="Contactez AgriCapital SARL à Gonaté, Daloa, Haut-Sassandra pour parler de plantation clé en main, palmier à huile, foncier agricole, patrimoine agricole ou partenariat."
      keywords="contact AgriCapital, AgriCapital SARL, Inocent KOFFI, investissement agricole Côte d’Ivoire, plantation clé en main, palmier à huile, foncier agricole, Daloa, Gonaté, Haut-Sassandra, partenariat agricole"
    />
    <DynamicNavigation />
    <main className="pt-[72px]"><ContactSection /></main>
    <Footer />
  </div>
);

export default ContactPage;
