import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CONSENT_KEY = "agricapital_analytics_consent";

const hasConsent = () => {
  try { return localStorage.getItem(CONSENT_KEY) === "accepted"; } catch { return false; }
};

const getVisitorId = () => {
  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("visitor_id", id);
  }
  return id;
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || navigator.webdriver) return;

    const track = async () => {
      if (!hasConsent()) return;
      try {
        const key = `visit:${location.pathname}`;
        const last = Number(sessionStorage.getItem(key) || 0);
        if (Date.now() - last < 30 * 60 * 1000) return;
        sessionStorage.setItem(key, String(Date.now()));

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
        if (!response.ok) {
          const { error } = await supabase.functions.invoke("record-visit", { body: visitPayload });
          if (error) console.warn("record-visit:", error.message);
        }
      } catch {
        // Analytics must never block navigation.
      }
    };

    void track();
    window.addEventListener("agricapital:consent-updated", track);
    return () => window.removeEventListener("agricapital:consent-updated", track);
  }, [location.pathname]);
};

export default usePageTracking;
