import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type VisitorStats = {
  total_visitors?: number;
  weekly_visitors?: number;
};

export const useVisitorCount = () => {
  // Versioned keys deliberately invalidate the old filtered/incorrect cached value (e.g. 42).
  const [totalVisitors, setTotalVisitors] = useState<number>(() => {
    const cached = localStorage.getItem("cached_public_total_visits_v4");
    return cached ? Number(cached) || 0 : 0;
  });
  const [weeklyVisitors, setWeeklyVisitors] = useState<number>(() => {
    const cached = localStorage.getItem("cached_public_weekly_visits_v4");
    return cached ? Number(cached) || 0 : 0;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchVisitorCount = async () => {
      try {
        // Read via the server-side function so public RLS/table grants cannot silently
        // leave an obsolete browser cache displayed.
        const { data, error } = await supabase.functions.invoke("visitor-stats", {
          method: "GET",
        });
        if (error) throw error;
        const stats = data as VisitorStats | null;
        if (!stats || typeof stats.total_visitors !== "number") {
          throw new Error("Historical public counter missing from visitor-stats response");
        }

        const total = Math.max(0, stats.total_visitors);
        const weekly = Math.max(0, Number(stats.weekly_visitors) || 0);
        if (!mounted) return;
        setTotalVisitors(total);
        setWeeklyVisitors(weekly);
        localStorage.setItem("cached_public_total_visits_v4", String(total));
        localStorage.setItem("cached_public_weekly_visits_v4", String(weekly));
      } catch (error) {
        console.warn("visitor-stats:", error);
        // Keep the latest valid v4 cache if the service is temporarily unavailable.
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
