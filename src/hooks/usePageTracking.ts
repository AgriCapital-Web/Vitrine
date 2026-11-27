import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CONSENT_KEY = "agricapital_analytics_consent";
const pendingPublicPageViews = new Set<string>();

const readConsent = () => {
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved === "accepted" || saved === "rejected") return saved;
  } catch {
    // Private browsing or restrictive browser settings may block localStorage.
  }
  try {
    const pair = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${CONSENT_KEY}=`));
    const saved = pair ? decodeURIComponent(pair.slice(CONSENT_KEY.length + 1)) : null;
    return saved === "accepted" || saved === "rejected" ? saved : null;
  } catch {
    return null;
  }
};

const hasConsent = () => readConsent() === "accepted";

const getVisitorId = () => {
  try {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("visitor_id", id);
    }
    return id;
  } catch {
    let id = sessionStorage.getItem("visitor_id");
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem("visitor_id", id);
    }
    return id;
  }
};

const recordPublicVisit = async (pagePath: string) => {
  if (pendingPublicPageViews.has(pagePath)) return;
  pendingPublicPageViews.add(pagePath);
  try {
    const { error } = await supabase.functions.invoke("record-public-visit", {
      body: { page_path: pagePath, referrer: document.referrer || null },
    });
    if (error) throw error;
  } catch (error) {
    console.warn("record-public-visit:", error);
  } finally {
    pendingPublicPageViews.delete(pagePath);
  }
};

export const usePageTracking = () => {
  const location = useLocation();

  // Le compteur global mesure une entrée réelle sur le site, indépendamment du choix
  // concernant les statistiques détaillées. Aucun identifiant ni donnée de navigation
  // n'est transmis par cet appel.
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    void recordPublicVisit(location.pathname);
  }, [location.pathname]);

  // Google Analytics et l'historique détaillé restent strictement soumis au consentement.
  useEffect(() => {
    if (location.pathname.startsWith("/admin") || navigator.webdriver) return;

    const trackAnalytics = async () => {
      if (!hasConsent()) return;

      const key = `visit:${location.pathname}`;
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(key) || 0);
      } catch {
        // Without session storage, rely on the server-side deduplication.
      }
      if (Date.now() - last < 30 * 60 * 1000) return;

      try {
        const visitPayload = {
          page_path: location.pathname,
          visitor_id: getVisitorId(),
          user_agent: navigator.userAgent,
          automation_flag: Boolean(navigator.webdriver),
          referrer: document.referrer || null,
        };

        const response = await fetch("/api/record-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(visitPayload),
          keepalive: true,
        });

        let recorded = response.ok;
        if (!response.ok) {
          const { error } = await supabase.functions.invoke("record-visit", { body: visitPayload });
          recorded = !error;
          if (error) console.warn("record-visit:", error.message);
        }

        if (recorded) {
          try {
            sessionStorage.setItem(key, String(Date.now()));
          } catch {
            // The database function still deduplicates concurrent/repeated requests.
          }
        }
      } catch (error) {
        console.warn("record-visit:", error);
      }
    };

    void trackAnalytics();
    window.addEventListener("agricapital:consent-updated", trackAnalytics);
    return () => window.removeEventListener("agricapital:consent-updated", trackAnalytics);
  }, [location.pathname]);
};

export default usePageTracking;
