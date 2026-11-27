import { csvCell, safeCsvValue } from "@/lib/csv-safe";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, TrendingUp, Users, Globe, Calendar, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const isAutomatedUA = (value: unknown) => /(?:\bbot\b|crawler|spider|headlesschrome|lighthouse|pagespeed|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|ahrefsbot|bingbot|googlebot|shapbot|reflectionbot|playwright|puppeteer|selenium|cypress|webdriver|curl\/|wget\/|python-requests|node\.js)/i.test(String(value || ""));
const isPreviewReferrer = (value: unknown) => /(?:lovable\.app|lovable\.dev|gpt-engineer-file-uploads)/i.test(String(value || ""));

interface VisitData {
  page_path: string;
  count: number;
}

interface CountItem { label: string; count: number }

interface DailyVisit {
  date: string;
  count: number;
}

const AdminAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalVisits, setTotalVisits] = useState(0);
  const [historicalTotal, setHistoricalTotal] = useState(0);
  const [historicalWeekly, setHistoricalWeekly] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [weekVisits, setWeekVisits] = useState(0);
  const [monthVisits, setMonthVisits] = useState(0);
  const [topPages, setTopPages] = useState<VisitData[]>([]);
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);
  const [topReferrers, setTopReferrers] = useState<{ referrer: string; count: number }[]>([]);
  const [topCountries, setTopCountries] = useState<{ country: string; count: number }[]>([]);
  const [topCities, setTopCities] = useState<{ city: string; count: number }[]>([]);
  const [topDevices, setTopDevices] = useState<CountItem[]>([]);
  const [suspectedBotVisits, setSuspectedBotVisits] = useState(0);
  const [humanVisits, setHumanVisits] = useState(0);
  const [recentPageViews, setRecentPageViews] = useState<{ page_path: string; referrer_host: string | null; device_type: string; created_at: string }[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const detailedVisits: any[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data: batch, error } = await supabase.from("page_visits")
          .select("page_path, user_agent, country, city, referrer, created_at")
          .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false }).range(offset, offset + 999);
        if (error) throw error;
        detailedVisits.push(...(batch || []));
        if (!batch || batch.length < 1000) break;
      }

      const { data: publicStats, error: publicStatsError } = await supabase.functions.invoke("admin-public-page-stats", { method: "GET" });
      if (publicStatsError) throw publicStatsError;
      if (!publicStats) throw new Error("Public page analytics unavailable");

      const { data: counter, error: counterError } = await supabase
        .from("visitor_counters")
        .select("total_visitors, weekly_visitors")
        .eq("id", "public")
        .maybeSingle();
      if (!counterError && counter) {
        setHistoricalTotal(Number(counter.total_visitors) || 0);
        setHistoricalWeekly(Number(counter.weekly_visitors) || 0);
      }

      const humanDetailedVisits = detailedVisits.filter((v: any) => !isAutomatedUA(v.user_agent) && !isPreviewReferrer(v.referrer));
      setSuspectedBotVisits(Number(publicStats.suspectedBotVisits) || 0);
      setHumanVisits(Number(publicStats.humanVisits) || 0);
      const countryCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};
      humanDetailedVisits.forEach((v: any) => {
        if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
        if (v.city) cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;
      });

      setTotalVisits(Number(publicStats.totalVisits) || 0);
      setTodayVisits(Number(publicStats.todayVisits) || 0);
      setWeekVisits(Number(publicStats.weekVisits) || 0);
      setMonthVisits(Number(publicStats.monthVisits) || 0);
      setTopPages(Array.isArray(publicStats.topPages) ? publicStats.topPages : []);
      setDailyVisits(Array.isArray(publicStats.dailyVisits) ? publicStats.dailyVisits : []);
      setTopReferrers(Array.isArray(publicStats.topReferrers) ? publicStats.topReferrers : []);
      setTopDevices(Array.isArray(publicStats.topDevices) ? publicStats.topDevices : []);
      setRecentPageViews(Array.isArray(publicStats.recentPageViews) ? publicStats.recentPageViews : []);
      setTopCountries(Object.entries(countryCounts).map(([country,count])=>({country,count})).sort((a,b)=>b.count-a.count));
      setTopCities(Object.entries(cityCounts).map(([city,count])=>({city,count})).sort((a,b)=>b.count-a.count).slice(0,10));
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Métrique", "Valeur"],
      ["Compteur historique cumulé", historicalTotal.toString()],
      ["Compteur historique de la semaine", historicalWeekly.toString()],
      ["Pages publiques consultées automatiquement (180 jours)", totalVisits.toString()],
      ["Visites Aujourd'hui", todayVisits.toString()],
      ["Visites Cette Semaine", weekVisits.toString()],
      ["Visites Ce Mois (robots identifiés exclus)", monthVisits.toString()],
      [""],
      ["Top Pages", "Visites"],
      ...topPages.map(p => [p.page_path || "/", p.count.toString()]),
    ].map(row => row.map(csvCell).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <AdminLayout title="Analytiques">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytiques">
      <div className="space-y-6">
        <Card className="border-primary/20"><CardHeader><CardTitle>Compteur historique conservé</CardTitle><CardDescription>Le total historique de départ est conservé. Il augmente désormais à chaque page publique consultée, sans identifiant visiteur.</CardDescription></CardHeader><CardContent className="flex flex-wrap items-end gap-8"><div><p className="text-3xl font-bold">{historicalTotal.toLocaleString()}</p><p className="text-xs text-muted-foreground">Visites cumulées</p></div><div><p className="text-2xl font-semibold">{historicalWeekly.toLocaleString()}</p><p className="text-xs text-muted-foreground">Compteur de la semaine, historique inclus</p></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Trafic automatisé détecté</CardTitle><CardDescription>Les visites automatisées restent comptées et sont identifiées séparément.</CardDescription></CardHeader><CardContent><p className="text-3xl font-bold">{suspectedBotVisits.toLocaleString()}</p><p className="text-xs text-muted-foreground">{humanVisits.toLocaleString()} pages vues ne sont pas classées comme automatisées, sur les 180 derniers jours. Cette classification repose sur la signature du navigateur et reste indicative.</p></CardContent></Card>
        {/* Export Button */}
        <div className="flex justify-end">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Visites non classées comme automatisées (180 jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalVisits.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{todayVisits}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Cette Semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{weekVisits}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Ce Mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{monthVisits}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dernières pages consultées</CardTitle>
            <CardDescription>Suivi automatique des pages publiques, avec date, appareil et domaine référent. Aucun identifiant personnel ni adresse IP n’est conservé.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPageViews.length ? (
              <div className="space-y-2">
                {recentPageViews.map((view, index) => (
                  <div key={view.created_at + view.page_path + index} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{view.page_path || "/"}</p>
                      <p className="text-xs text-muted-foreground">{view.referrer_host || "Accès direct"} · {view.device_type === "mobile" ? "Téléphone" : view.device_type === "tablet" ? "Tablette" : view.device_type === "desktop" ? "Ordinateur" : "Non déterminé"}</p>
                    </div>
                    <time className="text-xs text-muted-foreground">{new Date(view.created_at).toLocaleString("fr-FR")}</time>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Les nouvelles pages consultées apparaîtront ici.</p>}
          </CardContent>
        </Card>

        {/* Daily Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Visites des 7 Derniers Jours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {dailyVisits.map((day, index) => {
                const maxCount = Math.max(...dailyVisits.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <p className="text-xs mt-2 text-muted-foreground">{day.date}</p>
                    <p className="text-xs font-medium">{day.count}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Geography */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle>Pays des visites réelles</CardTitle><CardDescription>Uniquement les visites enregistrées depuis la correction du tracking.</CardDescription></CardHeader><CardContent>{topCountries.length ? <div className="space-y-2">{topCountries.map(x=><div key={x.country} className="flex justify-between text-sm"><span>{x.country}</span><span className="font-medium">{x.count}</span></div>)}</div> : <p className="text-muted-foreground">Aucune donnée géographique réelle pour le moment.</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle>Villes des visites réelles</CardTitle><CardDescription>Les villes apparaîtront au fur et à mesure des nouvelles visites.</CardDescription></CardHeader><CardContent>{topCities.length ? <div className="space-y-2">{topCities.map(x=><div key={x.city} className="flex justify-between text-sm"><span>{x.city}</span><span className="font-medium">{x.count}</span></div>)}</div> : <p className="text-muted-foreground">Aucune donnée géographique réelle pour le moment.</p>}</CardContent></Card>
        </div>

        {/* Device breakdown derived from recorded user-agent strings */}
        <Card>
          <CardHeader>
            <CardTitle>Types d’appareils</CardTitle>
            <CardDescription>Catégorie d’appareil déduite du navigateur, sans conserver son identifiant complet.</CardDescription>
          </CardHeader>
          <CardContent>
            {topDevices.length ? (
              <div className="space-y-3">
                {topDevices.map((device) => (
                  <div key={device.label} className="flex items-center justify-between text-sm">
                    <span>{device.label}</span>
                    <span className="font-medium tabular-nums">{device.count} visites</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted-foreground">Aucune donnée d’appareil disponible.</p>}
          </CardContent>
        </Card>

        {/* Top Pages & Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Pages les Plus Visitées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPages.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucune donnée</p>
              ) : (
                <div className="space-y-3">
                  {topPages.map((page, index) => (
                    <div key={page.page_path} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm truncate max-w-[200px]">{page.page_path || "/"}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{page.count} visites</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sources de Trafic</CardTitle>
              <CardDescription>Domaines référents enregistrés, sans conserver les URL complètes.</CardDescription>
            </CardHeader>
            <CardContent>
              {topReferrers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucun referrer enregistré</p>
              ) : (
                <div className="space-y-3">
                  {topReferrers.map((ref, index) => (
                    <div key={ref.referrer} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm truncate max-w-[250px]">{ref.referrer}</span>
                      <span className="text-sm font-medium">{ref.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
