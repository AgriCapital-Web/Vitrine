import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
    if (location.pathname.startsWith("/admin")) return;

    const track = async () => {
      try {
        const key = `visit:${location.pathname}`;
        const last = Number(sessionStorage.getItem(key) || 0);
        if (Date.now() - last < 30 * 60 * 1000) return;
        sessionStorage.setItem(key, String(Date.now()));

        const { error } = await supabase.functions.invoke("record-visit", {
          body: {
            page_path: location.pathname,
            visitor_id: getVisitorId(),
            user_agent: navigator.userAgent,
            referrer: document.referrer || null,
          },
        });
        if (error) console.warn("record-visit:", error.message);
      } catch {
        // Analytics must never block navigation.
      }
    };

    void track();
  }, [location.pathname]);
};

export default usePageTracking;
