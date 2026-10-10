import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, languageNames, Language } from "@/lib/translations";

export type { Language };
export { languageNames };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.fr;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const supportedLanguages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

const detectLanguageFromURL = (): Language | null => {
  const pathname = window.location.pathname;
  const pathLang = pathname.split('/')[1]?.toLowerCase();
  const queryLang = new URLSearchParams(window.location.search).get("lang")?.toLowerCase();
  
  if (pathLang && supportedLanguages.includes(pathLang as Language)) return pathLang as Language;
  if (queryLang && supportedLanguages.includes(queryLang as Language)) return queryLang as Language;
  return null;
};

const detectBrowserLanguage = (): Language => {
  // IMPORTANT: French is the PRIMARY and DEFAULT language for AgriCapital
  // This is because AgriCapital is based in Côte d'Ivoire (francophone country)
  // and the majority of users are French speakers
  
  // Check navigator language (device/system language)
  const browserLang = navigator.language || (navigator as any).userLanguage;
  const langCode = browserLang?.split('-')[0]?.toLowerCase();
  
  // If browser language is French, return French immediately
  if (langCode === 'fr') {
    return 'fr';
  }
  
  // Check navigator languages array (ordered by user preference)
  const languages = navigator.languages || [];
  
  // First priority: Check if French is in the user's preferred languages
  for (const lang of languages) {
    const code = lang.split('-')[0].toLowerCase();
    if (code === 'fr') {
      return 'fr';
    }
  }
  
  // Second priority: Check for other supported languages
  if (langCode && supportedLanguages.includes(langCode as Language)) {
    return langCode as Language;
  }
  
  for (const lang of languages) {
    const code = lang.split('-')[0].toLowerCase();
    if (supportedLanguages.includes(code as Language)) {
      return code as Language;
    }
  }
  
  // DEFAULT: Always return French as the fallback
  // This ensures French-speaking users in Côte d'Ivoire see French content
  return 'fr';
};

const getInitialLanguage = (): Language => {
  // An explicit language in the URL always wins.
  const urlLang = detectLanguageFromURL();
  if (urlLang) return urlLang;

  // Search engines must always receive the French default metadata/content.
  // Otherwise a crawler running an English browser can index English titles
  // for the clean French URLs.
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|linkedinbot/i.test(userAgent)) {
    return "fr";
  }

  // Respect a deliberate language choice, but ignore old stored preferences
  // created before system-language detection was made the default.
  try {
    const saved = localStorage.getItem("language");
    const manualChoice = localStorage.getItem("language-manual-choice") === "1";
    if (manualChoice && saved && supportedLanguages.includes(saved as Language)) {
      return saved as Language;
    }
  } catch {
    // Storage can be disabled; continue with the device language.
  }

  // Human visitors follow their device/browser language when supported.
  // French remains the fallback for Côte d'Ivoire and unsupported locales.
  return detectBrowserLanguage();
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Custom setLanguage that also updates localStorage immediately
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("language", lang);
      localStorage.setItem("language-manual-choice", "1");
    } catch {
      // Language still changes for the current session when storage is blocked.
    }
  };

  // Listen for URL changes
  useEffect(() => {
    const urlLang = detectLanguageFromURL();
    if (urlLang && urlLang !== language) {
      setLanguageState(urlLang);
      try {
        localStorage.setItem("language", urlLang);
      } catch {
        // URL remains the source of truth when storage is blocked.
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};