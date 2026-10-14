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
      "url": "https://www.agricapital.ci/og-image.png",
      "width": 1200,
      "height": 630
    },
    "image": "https://www.agricapital.ci/og-image.png",
    "description": language === 'fr' 
      ? "AgriCapital facilite l’accès au foncier agricole et aux plantations de palmier à huile clé en main, avec ou sans terre, à Gonaté et Daloa."
      : "AgriCapital supports landowners and small farmers in creating and developing oil palm plantations in Ivory Coast.",
    "foundingDate": "2025",
    "founder": {
      "@type": "Person",
      "name": "Inocent KOFFI",
      "url": "https://www.ikoffi.agricapital.ci/",
      "sameAs": ["https://www.ikoffi.agricapital.ci/", "https://www.linkedin.com/in/inocent-k-4a08b7159/"]
    },
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
    "image": "https://www.agricapital.ci/og-image.png",
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
            ? "AgriCapital est une entreprise ivoirienne qui accompagne les propriétaires terriens et petits agriculteurs dans la création et le développement de plantations de palmiers à huile, sans barrières financières."
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
            ? "AgriCapital propose un accompagnement de projets agricoles et de plantations de palmier à huile selon les offres retenues, avec des modalités précisées dans le cadre contractuel."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": "https://www.ikoffi.agricapital.ci/#person",
          "name": "Inocent KOFFI",
          "url": "https://www.ikoffi.agricapital.ci/",
          "jobTitle": "Fondateur et Gérant d’AgriCapital SARL",
          "worksFor": { "@type": "Organization", "@id": "https://www.agricapital.ci/#organization", "name": "AgriCapital SARL", "url": "https://www.agricapital.ci/" },
          "knowsAbout": ["Investissement agricole en Côte d’Ivoire", "Investissement foncier", "Patrimoine agricole", "Actifs agricoles productifs", "Foncier agricole", "Plantation clé en main avec ou sans terre", "Palmier à huile", "Développement agricole à Gonaté et Daloa", "Accompagnement de projets agricoles"],
          "sameAs": ["https://www.agricapital.ci/", "https://www.ikoffi.agricapital.ci/"]
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};

export default SEOJsonLD;
