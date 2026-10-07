import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Phone, Mail, MessageCircle, ChevronRight, Leaf, Users, TrendingUp, Shield, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqTranslations: Record<string, FAQItem[]> = {
  fr: [
    { category: "general", question: "Qu'est-ce qu'AgriCapital ?", answer: "AGRICAPITAL SARL est une entreprise ivoirienne spécialisée dans la création et le développement de plantations de palmier à huile. AgriCapital rend l’accès à l’agriculture productive plus accessible, avec ou sans foncier, grâce à des parcours structurés et un accompagnement dans la durée." },
    { category: "general", question: "Quel est le modèle économique d'AgriCapital ?", answer: "AgriCapital propose plusieurs parcours selon la situation du client : PalmInvest sans foncier, TerraPalm avec une terre disponible et PalmTerroir pour une parcelle avec les moyens nécessaires à la mise en place. Les modalités d’accompagnement et de paiement dépendent de l’offre retenue." },
    { category: "general", question: "Où se trouve AgriCapital ?", answer: "Notre siège est situé à Daloa, dans la région du Haut-Sassandra en Côte d'Ivoire. Notre zone opérationnelle couvre actuellement Daloa, Zoukougbeu et Issia." },
    { category: "general", question: "AgriCapital est-elle une entreprise légale ?", answer: "Oui, AGRICAPITAL SARL est formellement constituée et opérationnelle, immatriculée au RCCM sous le numéro CI-DAL-01-2025-B12-13435." },
    { category: "general", question: "À qui s'adresse AgriCapital ?", answer: "Nos offres s’adressent aux personnes qui souhaitent accéder à une plantation de palmier à huile, avec ou sans foncier, ainsi qu’aux propriétaires qui souhaitent valoriser une terre par la création d’une plantation." },
    { category: "accompagnement", question: "En quoi consiste l'accompagnement d'AgriCapital ?", answer: "Selon l’offre retenue, AgriCapital intervient notamment sur la sécurisation du foncier, la création et la mise en place de la plantation, le suivi technique et la facilitation de la commercialisation. Les responsabilités de gestion et d’entretien sont précisées dans le parcours contractuel." },
    { category: "accompagnement", question: "Quelle est la durée de développement d'une plantation ?", answer: "Le calendrier de développement dépend de la date de mise en terre et du parcours retenu. AgriCapital accompagne les différentes étapes de création et de développement de la plantation selon les conditions contractuelles." },
    { category: "accompagnement", question: "D'où proviennent les plants de palmier ?", answer: "Les plants sont issus de semences d’origine Iro Lamé fournies par notre partenaire Les Palmistes. Le matériel végétal est sélectionné pour être adapté au projet et aux conditions de la parcelle." },
    { category: "accompagnement", question: "Quelles sont les étapes opérationnelles ?", answer: "Le parcours se structure autour de cinq séquences : identification et validation, contractualisation, mise en place de la plantation, accompagnement technique et valorisation de la production." },
    { category: "garanties", question: "Quels engagements prend AgriCapital ?", answer: "AgriCapital s’appuie sur une documentation des opérations et un accompagnement technique adapté à chaque offre. Les engagements précis, les responsabilités et les modalités d’intervention sont définis dans les contrats correspondants." },
    { category: "garanties", question: "Comment AgriCapital structure-t-elle ses opérations ?", answer: "La structuration repose sur l’identification et la documentation des parcelles, la traçabilité des opérations, le suivi technique et des engagements définis dans les contrats correspondants." },
    { category: "offres", question: "Quelles sont les formules proposées ?", answer: "AgriCapital propose PalmInvest pour les clients sans foncier, TerraPalm pour les clients disposant d’une terre et PalmTerroir pour les personnes disposant d’une parcelle et de la main-d’œuvre nécessaire à la mise en place, avec deux formules d’accompagnement." },
    { category: "offres", question: "Quelle est la capacité opérationnelle actuelle ?", answer: "Notre capacité opérationnelle comprend : 120 hectares de pépinière en développement, plus de 500 hectares de terres identifiées, des partenariats logistiques et industriels structurés, et une équipe technique dédiée sur le terrain." },
    { category: "offres", question: "Le modèle contribue-t-il à la durabilité environnementale ?", answer: "Oui, AgriCapital promeut des pratiques agricoles respectueuses de l'environnement : variétés adaptées au climat local, fertilisation raisonnée, gestion intégrée des cultures et préservation de la biodiversité environnante." },
    { category: "investissement", question: "Comment puis-je devenir client AgriCapital ?", answer: "Pour devenir client, contactez notre équipe. Nous présentons l’offre adaptée à votre situation, son parcours, ses conditions et les étapes de contractualisation avant le démarrage des opérations." },
    { category: "investissement", question: "Y a-t-il un espace dédié aux clients ?", answer: "Oui, AgriCapital met à disposition un Espace Clients accessible via client.agricapital.ci, permettant le suivi de vos plantations, l'accès aux documents et la communication directe avec nos équipes techniques." },
    { category: "entreprise", question: "Quelle est l’expérience de l’équipe AgriCapital ?", answer: "L’équipe AgriCapital s’appuie sur plus d’une décennie d’expérience terrain dans les communautés rurales ivoiriennes et sur des compétences mobilisées en agronomie, gestion de projets, droit et comptabilité." },
    { category: "entreprise", question: "Quelle est la vision d'AgriCapital ?", answer: "Notre vision est de créer de la valeur agricole durable en accompagnant nos clients dans la constitution d'un patrimoine pérenne, tout en contribuant au développement structuré de la filière palmier à huile en Côte d'Ivoire." },
    { category: "entreprise", question: "Comment contacter AgriCapital ?", answer: "Vous pouvez nous joindre par téléphone/WhatsApp au +225 05 64 55 17 17, par email à contact@agricapital.ci, ou visiter notre site web www.agricapital.ci. Notre siège est situé à Daloa, Côte d'Ivoire." },
  ],
  en: [
    { category: "general", question: "What is AgriCapital?", answer: "AGRICAPITAL SARL is an Ivorian company specializing in the turnkey creation and management of oil palm plantations. We support individuals, professionals and landowners in building a sustainable and profitable agricultural heritage." },
    { category: "general", question: "What is AgriCapital's business model?", answer: "AgriCapital offers several pathways depending on the client’s situation: PalmInvest without land, TerraPalm with available land, and PalmTerroir for a plot with the resources needed for set-up. Support and payment terms depend on the selected offer." },
    { category: "general", question: "Where is AgriCapital located?", answer: "Our headquarters is in Daloa, in the Haut-Sassandra region of Côte d'Ivoire. Our operational zone currently covers Daloa, Zoukougbeu and Issia." },
    { category: "general", question: "Is AgriCapital a legally registered company?", answer: "Yes, AGRICAPITAL SARL is formally constituted and operational, registered under RCCM number CI-DAL-01-2025-B12-13435." },
    { category: "general", question: "Who is AgriCapital for?", answer: "Our offers are designed for people who want access to an oil palm plantation, with or without land, and for landowners who want to develop their land through plantation creation." },
    { category: "accompagnement", question: "What does AgriCapital's support include?", answer: "Depending on the selected offer, AgriCapital may handle land security, plantation creation and set-up, technical monitoring and facilitation of production market access. Management and maintenance responsibilities are defined in the contractual pathway." },
    { category: "accompagnement", question: "How long does plantation development take?", answer: "The development timeline depends on the planting date and selected pathway. AgriCapital supports the creation and development stages according to the applicable contractual conditions." },
    { category: "accompagnement", question: "Where do palm seedlings come from?", answer: "Our seedlings are sourced from Iro Lamé origin seeds supplied by our partner Les Palmistes. The planting material is selected according to the project and plot conditions." },
    { category: "accompagnement", question: "What are the operational steps?", answer: "The pathway is structured around five stages: identification and validation, contracting, plantation set-up, technical support, and production valorization." },
    { category: "garanties", question: "What commitments does AgriCapital make?", answer: "AgriCapital relies on documented operations and technical support adapted to each offer. Specific commitments, responsibilities and intervention terms are defined in the corresponding contracts." },
    { category: "garanties", question: "How does AgriCapital structure its operations?", answer: "The structure relies on plot identification and documentation, operational traceability, technical monitoring and commitments defined in the corresponding contracts." },
    { category: "offres", question: "What formulas are offered?", answer: "AgriCapital offers PalmInvest for clients without land, TerraPalm for clients with land, and PalmTerroir for people with a plot and the workforce needed for set-up, with two support formulas." },
    { category: "offres", question: "What is the current operational capacity?", answer: "Our operational capacity includes: over 100 hectares of nursery in full growth (April 2026), over 500 hectares of identified land, structured logistic and industrial partnerships, and a dedicated technical field team." },
    { category: "offres", question: "Does the project contribute to environmental sustainability?", answer: "Yes, AgriCapital promotes environmentally friendly agricultural practices: locally adapted varieties, reasoned fertilization, integrated crop management and preservation of surrounding biodiversity." },
    { category: "investissement", question: "How can I become an AgriCapital client?", answer: "To become a client, contact our team. We present the offer suited to your situation, its pathway and conditions, then guide you through contracting and the start of operations." },
    { category: "investissement", question: "Is there a dedicated client portal?", answer: "Yes, AgriCapital provides a Client Portal accessible via client.agricapital.ci, allowing plantation tracking, document access and direct communication with our technical teams." },
    { category: "entreprise", question: "What is the AgriCapital team's experience?", answer: "The AgriCapital team has over a decade of field experience in Ivorian rural communities, having visited more than 360 localities across 8 regions. It includes experts in agronomy, project management, law and accounting." },
    { category: "entreprise", question: "What is AgriCapital's vision?", answer: "Our vision is to create sustainable agricultural value by supporting our clients in building enduring heritage, while contributing to the structured development of the oil palm industry in Côte d'Ivoire." },
    { category: "entreprise", question: "How to contact AgriCapital?", answer: "You can reach us by phone/WhatsApp at +225 05 64 55 17 17, by email at contact@agricapital.ci, or visit our website www.agricapital.ci. Our headquarters is in Daloa, Côte d'Ivoire." },
  ],
};

// Fallback to French for other languages (auto-translation handled by site-wide translator)
faqTranslations.ar = faqTranslations.fr;
faqTranslations.es = faqTranslations.fr;
faqTranslations.de = faqTranslations.fr;
faqTranslations.zh = faqTranslations.fr;

const FAQ = () => {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("general");
  const navigate = useNavigate();

  const ft = t.faq || {
    title: "Foire Aux Questions",
    subtitle: "Trouvez rapidement les réponses à vos questions.",
    categories: { general: "Général", offers: "Nos Offres", investment: "Devenir Client", support: "Accompagnement", guarantees: "Garanties", company: "L'Entreprise" },
    noQuestions: "Aucune question dans cette catégorie.",
    ctaTitle: "Vous n'avez pas trouvé votre réponse ?",
    ctaSubtitle: "Notre équipe est disponible pour répondre à toutes vos questions.",
    contactUs: "Nous contacter",
  };

  const categories = [
    { id: "general", label: ft.categories.general, icon: HelpCircle },
    { id: "offres", label: ft.categories.offers, icon: Leaf },
    { id: "investissement", label: ft.categories.investment, icon: TrendingUp },
    { id: "accompagnement", label: ft.categories.support, icon: Users },
    { id: "garanties", label: ft.categories.guarantees, icon: Shield },
    { id: "entreprise", label: ft.categories.company, icon: Building2 },
  ];

  const faqItems = faqTranslations[language] || faqTranslations.fr;
  const filteredFAQ = faqItems.filter(item => item.category === activeCategory);

  const scrollToContact = () => {
    navigate('/#contact');
  };

  return (
    <>
      <SEOHead />
      <DynamicNavigation />
      
      <main className="public-page min-h-screen pt-[72px]">
        <section className="public-page-header"><div className="public-page-header-inner">
          <div className="container mx-auto px-4 text-center">
            <HelpCircle className="w-10 h-10 mb-5 text-accent" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">{ft.title}</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">{ft.subtitle}</p>
          </div>
        </div></section>

        <section className="border-b bg-card/50 py-8">
          <div className="site-container px-4">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "outline"}
                    className={`flex items-center gap-2 ${activeCategory === cat.id ? "bg-agri-green hover:bg-agri-green-dark text-white" : ""}`}
                    onClick={() => setActiveCategory(cat.id)}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.split(" ")[0]}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card border rounded-lg px-4 sm:px-6 shadow-sm">
                  <AccordionTrigger className="text-left hover:no-underline py-4 sm:py-5">
                    <span className="text-sm sm:text-base font-medium pr-4">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4 sm:pb-5 leading-relaxed">
                    {item.answer.includes('Inocent KOFFI') ? (
                      item.answer.split('Inocent KOFFI').map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && <strong className="text-foreground font-bold">Inocent KOFFI</strong>}
                        </span>
                      ))
                    ) : item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFAQ.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{ft.noQuestions}</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gradient-to-r from-agri-green/10 to-accent/10">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto border-2 border-agri-green/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl sm:text-2xl">{ft.ctaTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">{ft.ctaSubtitle}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={scrollToContact} className="bg-agri-green hover:bg-agri-green-dark">
                    <MessageCircle className="w-4 h-4 mr-2" />{ft.contactUs}<ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="outline" asChild><a href="tel:+2250564551717"><Phone className="w-4 h-4 mr-2" />05 64 55 17 17</a></Button>
                  <Button variant="outline" asChild><a href="mailto:contact@agricapital.ci"><Mail className="w-4 h-4 mr-2" />Email</a></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FAQ;
