import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVisitorCount = () => {
  const [totalVisitors, setTotalVisitors] = useState<number>(() => {
    const cached = localStorage.getItem("cached_public_total_visits_v3");
    return cached ? Number(cached) || 0 : 0;
  });
  const [weeklyVisitors, setWeeklyVisitors] = useState<number>(() => {
    const cached = localStorage.getItem("cached_public_weekly_visits_v3");
    return cached ? Number(cached) || 0 : 0;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchVisitorCount = async () => {
      try {
        // The public counter is a historical cumulative counter, not a distinct-person estimate.
        // Read it directly so filtering heuristics never replace the historical 9k+ total.
        const { data, error } = await supabase
          .from("visitor_counters")
          .select("total_visitors, weekly_visitors")
          .eq("id", "public")
          .maybeSingle();
        if (error) throw error;

        const total = Math.max(0, Number(data?.total_visitors) || 0);
        const weekly = Math.max(0, Number(data?.weekly_visitors) || 0);

        if (!mounted) return;
        setTotalVisitors(total);
        setWeeklyVisitors(weekly);
        localStorage.setItem("cached_public_total_visits_v3", String(total));
        localStorage.setItem("cached_public_weekly_visits_v3", String(weekly));
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
