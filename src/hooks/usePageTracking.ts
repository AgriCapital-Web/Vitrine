import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const pendingPublicPageViews = new Set<string>();

const recordPublicVisit = async (pagePath: string) => {
  if (pendingPublicPageViews.has(pagePath)) return;
  pendingPublicPageViews.add(pagePath);
  try {
    const { error } = await supabase.functions.invoke("record-public-visit", {
      body: {
        page_path: pagePath,
        referrer: document.referrer || null,
        automation_flag: Boolean(navigator.webdriver),
      },
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

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    void recordPublicVisit(location.pathname);
  }, [location.pathname]);
};

export default usePageTracking;
