import { csvCell, safeCsvValue } from "@/lib/csv-safe";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, TrendingUp, Users, Globe, Calendar, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const isAutomatedUA = (value: unknown) => /(?:\bbot\b|crawler|spider|headlesschrome|lighthouse|pagespeed|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|ahrefsbot|bingbot|googlebot|shapbot|reflectionbot|playwright|puppeteer|selenium|cypress|webdriver|curl\/|wget\/|python-requests|node\.js)/i.test(String(value || ""));

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

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const visits: any[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data: batch, error } = await supabase.from("page_visits")
          .select("page_path, user_agent, country, city, referrer, created_at")
          .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false }).range(offset, offset + 999);
        if (error) throw error;
        visits.push(...(batch || []));
        if (!batch || batch.length < 1000) break;
      }
      const humanVisits = visits.filter((v: any) => !isAutomatedUA(v.user_agent));
      setSuspectedBotVisits(visits.length - humanVisits.length);
      const now = new Date();
      const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(now); monthStart.setDate(monthStart.getDate() - 30);
      setTotalVisits(humanVisits.length);
      setTodayVisits(humanVisits.filter((v: any) => new Date(v.created_at) >= todayStart).length);
      setWeekVisits(humanVisits.filter((v: any) => new Date(v.created_at) >= weekStart).length);
      setMonthVisits(humanVisits.filter((v: any) => new Date(v.created_at) >= monthStart).length);

      const pageCount: Record<string, number> = {};
      const deviceCounts: Record<string, number> = {};
      const countryCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};
      const refCounts: Record<string, number> = {};
      const dailyCounts: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now); date.setDate(date.getDate() - i); date.setHours(0, 0, 0, 0);
        dailyCounts[date.toISOString().split("T")[0]] = 0;
      }
      humanVisits.forEach((v: any) => {
        const path = v.page_path || "/";
        pageCount[path] = (pageCount[path] || 0) + 1;
        if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
        if (v.city) cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;
        const ua = String(v.user_agent || "").toLowerCase();
        const device = /ipad|tablet|kindle|silk/.test(ua) ? "Tablette"
          : /mobile|iphone|ipod|android/.test(ua) ? "Téléphone"
          : ua ? "Ordinateur" : "Non déterminé";
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        if (v.referrer) {
          try {
            const source = new URL(v.referrer).hostname.replace(/^www\./, "");
            refCounts[source] = (refCounts[source] || 0) + 1;
          } catch {
            refCounts["Référent non reconnu"] = (refCounts["Référent non reconnu"] || 0) + 1;
          }
        }
        if (!v.referrer) refCounts["Direct / référent absent"] = (refCounts["Direct / référent absent"] || 0) + 1;
        const date = new Date(v.created_at);
        const day = date.toISOString().split("T")[0];
        if (dailyCounts[day] !== undefined) dailyCounts[day] += 1;
      });
      setTopPages(Object.entries(pageCount).map(([page_path, count]) => ({ page_path, count })).sort((a,b)=>b.count-a.count).slice(0,10));
      setTopDevices(Object.entries(deviceCounts).map(([label,count])=>({label,count})).sort((a,b)=>b.count-a.count));
      setTopCountries(Object.entries(countryCounts).map(([country,count])=>({country,count})).sort((a,b)=>b.count-a.count));
      setTopCities(Object.entries(cityCounts).map(([city,count])=>({city,count})).sort((a,b)=>b.count-a.count).slice(0,10));
      setTopReferrers(Object.entries(refCounts).map(([referrer,count])=>({referrer,count})).sort((a,b)=>b.count-a.count).slice(0,10));
      setDailyVisits(Object.entries(dailyCounts).map(([date,count])=>({
        date: new Date(date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }), count
      })));
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Métrique", "Valeur"],
      ["Visites détectées (180 jours)", totalVisits.toString()],
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
        <Card><CardHeader><CardTitle>Robots et profils de navigateur suspects</CardTitle><CardDescription>Conservés dans l’historique, mais exclus des indicateurs de trafic humain estimé.</CardDescription></CardHeader><CardContent><p className="text-3xl font-bold">{suspectedBotVisits.toLocaleString()}</p><p className="text-xs text-muted-foreground">Sur les 180 derniers jours disponibles. Le filtre reconnaît les agents connus, les navigateurs headless et deux signatures de navigateur obsolètes à volume anormal. Certains robots peuvent encore se présenter comme des navigateurs ordinaires.</p></CardContent></Card>
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
                Visites détectées (180 jours)
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
            <CardDescription>Estimation à partir du navigateur déclaré lors des visites enregistrées.</CardDescription>
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
              <CardDescription>D'où viennent vos visiteurs</CardDescription>
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
