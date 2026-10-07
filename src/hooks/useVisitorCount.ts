import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const BASE_TOTAL = 4126;

export const useVisitorCount = () => {
  const [totalVisitors, setTotalVisitors] = useState<number>(() => {
    const cached = localStorage.getItem("cached_visitor_count");
    return Math.max(BASE_TOTAL, cached ? Number(cached) || 0 : 0);
  });
  const [weeklyVisitors, setWeeklyVisitors] = useState<number>(() => {
    const cached = localStorage.getItem("cached_weekly_count");
    return cached ? Number(cached) || 0 : 0;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchVisitorCount = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("visitor-stats", { method: "GET" });
        if (error) throw error;

        const total = Math.max(BASE_TOTAL, Number(data?.total_visitors) || 0);
        const weekly = Math.max(0, Number(data?.weekly_visitors) || 0);

        if (!mounted) return;
        setTotalVisitors(total);
        setWeeklyVisitors(weekly);
        localStorage.setItem("cached_visitor_count", String(total));
        localStorage.setItem("cached_weekly_count", String(weekly));
      } catch (error) {
        console.warn("visitor-stats:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchVisitorCount();
    const interval = window.setInterval(fetchVisitorCount, 60_000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return { totalVisitors, weeklyVisitors, isLoading };
};

export default useVisitorCount;
