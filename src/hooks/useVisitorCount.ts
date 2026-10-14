import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type VisitorStats = {
  total_visitors?: number;
  weekly_visitors?: number;
};

export const useVisitorCount = () => {
  // Never initialize the public historical counter from the filtered unique-browser cache.
  // Prefer the last known cumulative value while the authoritative database request runs.
  const readCachedTotal = () => Math.max(0, ...[
    "cached_public_total_visits_v5",
    "cached_public_total_visits_v4",
    "cached_visitor_count",
  ].map((key) => Number(localStorage.getItem(key) || 0)).filter(Number.isFinite));
  const [totalVisitors, setTotalVisitors] = useState<number>(() => readCachedTotal());
  const [weeklyVisitors, setWeeklyVisitors] = useState<number>(() => Math.max(0,
    Number(localStorage.getItem("cached_public_weekly_visits_v5")
      || localStorage.getItem("cached_public_weekly_visits_v4")
      || localStorage.getItem("cached_weekly_count") || 0) || 0
  ));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchVisitorCount = async () => {
      try {
        // The public row in visitor_counters is the source of truth for the historical total.
        // If direct table access is temporarily unavailable, fall back to the server function.
        let stats: VisitorStats | null = null;
        const direct = await supabase
          .from("visitor_counters")
          .select("total_visitors,weekly_visitors")
          .eq("id", "public")
          .maybeSingle();

        if (!direct.error && direct.data && typeof direct.data.total_visitors === "number") {
          stats = {
            total_visitors: Number(direct.data.total_visitors),
            weekly_visitors: Number(direct.data.weekly_visitors) || 0,
          };
        } else {
          const { data, error } = await supabase.functions.invoke("visitor-stats", { method: "GET" });
          if (error) throw error;
          stats = data as VisitorStats | null;
        }

        if (!stats || typeof stats.total_visitors !== "number") {
          throw new Error("Historical public counter unavailable");
        }

        // A cumulative historical counter must not regress because of a stale cache or a
        // temporary function response. Unique visitors are shown separately in admin analytics.
        const total = Math.max(0, Number(stats.total_visitors) || 0, readCachedTotal());
        const weekly = Math.max(0, Number(stats.weekly_visitors) || 0);
        if (!mounted) return;
        setTotalVisitors(total);
        setWeeklyVisitors(weekly);
        localStorage.setItem("cached_public_total_visits_v5", String(total));
        localStorage.setItem("cached_public_weekly_visits_v5", String(weekly));
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
