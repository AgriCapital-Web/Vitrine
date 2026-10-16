import { useLanguage } from "@/contexts/LanguageContext";

const SEOJsonLD = () => {
  const { language } = useLanguage();
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.agricapital.ci/#organization",
    "name": "AgriCapital",
    "alternateName": "AGRICAPITAL SARL",
    "url": "https://www.agricapital.ci",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.agricapital.ci/Logo_AgriCapital_-V2-4.png",
      "width": 1200,
      "height": 630
    },
    "image": "https://www.agricapital.ci/Logo_AgriCapital_-V2-4.png",
    "description": language === 'fr' 
      ? "AgriCapital facilite l’accès au foncier agricole et aux plantations de palmier à huile clé en main, avec ou sans terre, à Gonaté et Daloa."
      : "AgriCapital supports landowners and small farmers in creating and developing oil palm plantations in Ivory Coast.",
    "foundingDate": "2025",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gonaté",
      "addressLocality": "Daloa",
      "addressRegion": "Haut-Sassandra",
      "addressCountry": "CI"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 6.905935222212314,
      "longitude": -6.249822932129582
    },
    "areaServed": {
      "@type": "Country",
      "name": "Côte d'Ivoire"
    },
    "sameAs": [
      "https://www.facebook.com/agricapitalci",
      "https://www.linkedin.com/company/agricapital-ci"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["French", "English", "Arabic", "Spanish", "German", "Chinese"]
    },
    "slogan": "Vos Terres Reprennent Vie",
    "knowsAbout": [
      "Palmier à huile",
      "Agriculture durable",
      "Développement rural",
      "Côte d'Ivoire"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.agricapital.ci/#localbusiness",
    "name": "AgriCapital",
    "image": "https://www.agricapital.ci/Logo_AgriCapital_-V2-4.png",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gonaté",
      "addressLocality": "Daloa",
      "addressRegion": "Haut-Sassandra",
      "postalCode": "",
      "addressCountry": "CI"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 6.905935222212314,
      "longitude": -6.249822932129582
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "17:00"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.agricapital.ci/#website",
    "url": "https://www.agricapital.ci",
    "name": "AgriCapital — Investissement agricole et plantation clé en main en Côte d’Ivoire",
    "description": "AgriCapital accompagne les projets agricoles, le foncier et les plantations de palmier à huile clé en main en Côte d’Ivoire, avec ou sans terre.",
    "publisher": {
      "@id": "https://www.agricapital.ci/#organization"
    },
    "inLanguage": language,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.agricapital.ci/?s={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": language === 'fr' 
          ? "Qu'est-ce qu'AgriCapital ?" 
          : "What is AgriCapital?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === 'fr'
            ? "AgriCapital accompagne les porteurs de projets agricoles, avec ou sans terre, dans la création et le développement de plantations de palmier à huile selon l’offre retenue."
            : "AgriCapital supports agricultural projects and turnkey oil palm plantations in Côte d’Ivoire, with or without land, according to the selected offer and applicable terms."
        }
      },
      {
        "@type": "Question",
        "name": language === 'fr'
          ? "Où se trouve AgriCapital ?"
          : "Where is AgriCapital located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === 'fr'
            ? "AgriCapital est basé à Gonaté, Daloa, en Côte d'Ivoire."
            : "AgriCapital is based in Gonaté, Daloa, Ivory Coast."
        }
      },
      {
        "@type": "Question",
        "name": language === 'fr'
          ? "Quels services propose AgriCapital ?"
          : "What services does AgriCapital offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === 'fr'
            ? "AgriCapital propose un modèle intégré comprenant : plants certifiés, intrants, support technique, formation, suivi régulier et garantie de rachat sur 20 ans."
            : "AgriCapital offers an integrated model including: certified plants, inputs, technical support, training, regular monitoring, and a 20-year buyback guarantee."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};

export default SEOJsonLD;
