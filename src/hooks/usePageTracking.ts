import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CONSENT_KEY = "agricapital_analytics_consent";

const readConsent = () => {
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved === "accepted" || saved === "rejected") return saved;
  } catch {
    // Private browsing or restrictive browser settings may block localStorage.
  }
  try {
    const match = document.cookie.match(new RegExp("(?:^|;\\\\s*)" + CONSENT_KEY + "=([^;]+)"));
    const saved = match ? decodeURIComponent(match[1]) : null;
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
    // Keep a session-scoped identifier when persistent storage is unavailable.
    let id = sessionStorage.getItem("visitor_id");
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem("visitor_id", id);
    }
    return id;
  }
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || navigator.webdriver) return;

    const track = async () => {
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

        // Do not suppress a retry for 30 minutes when the recording request failed.
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

    void track();
    window.addEventListener("agricapital:consent-updated", track);
    return () => window.removeEventListener("agricapital:consent-updated", track);
  }, [location.pathname]);
};

export default usePageTracking;
