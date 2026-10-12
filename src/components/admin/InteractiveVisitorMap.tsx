import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface VisitorPlace {
  country: string;
  city: string;
  count: number;
}

const InteractiveVisitorMap = () => {
  const [places, setPlaces] = useState<VisitorPlace[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [uniqueCountries, setUniqueCountries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    void fetchVisitorLocations();
    const channel = supabase
      .channel("visitor-locations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_visits" }, () => {
        void fetchVisitorLocations();
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, []);

  const fetchVisitorLocations = async () => {
    setIsLoading(true);
    try {
      const { data, error, count } = await supabase
        .from("page_visits")
        .select("country, city", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(5000);

      if (error) throw error;
      const countries = new Set<string>();
      const counts: Record<string, VisitorPlace> = {};
      (data || []).forEach((visit: any) => {
        const country = String(visit.country || "").trim();
        const city = String(visit.city || "").trim();
        if (country) countries.add(country);
        if (!country && !city) return;
        const key = `${country || "Pays non déterminé"}|${city || "Ville non déterminée"}`;
        if (!counts[key]) counts[key] = {
          country: country || "Pays non déterminé",
          city: city || "Ville non déterminée",
          count: 0,
        };
        counts[key].count += 1;
      });
      setPlaces(Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 12));
      setTotalVisits(count || data?.length || 0);
      setUniqueCountries(countries.size);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Visitor geography:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Répartition géographique des visiteurs
            </CardTitle>
            <CardDescription className="mt-1">
              Pays et villes transmis par l’infrastructure lorsque cette information est disponible.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void fetchVisitorLocations()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
        {lastUpdate && <p className="text-xs text-muted-foreground">Dernière mise à jour : {lastUpdate.toLocaleTimeString("fr-FR")}</p>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span className="text-xl font-bold">{totalVisits.toLocaleString("fr-FR")}</span></div>
            <p className="text-xs text-muted-foreground mt-1">Visites enregistrées</p>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-green-600" /><span className="text-xl font-bold">{uniqueCountries}</span></div>
            <p className="text-xs text-muted-foreground mt-1">Pays identifiés</p>
          </div>
        </div>
        {places.length ? (
          <div className="space-y-2">
            {places.map((place) => (
              <div key={`${place.country}-${place.city}`} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{place.city}</p>
                    <p className="text-xs text-muted-foreground truncate">{place.country}</p>
                  </div>
                </div>
                <Badge variant="secondary">{place.count.toLocaleString("fr-FR")}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-5 text-center">
            {isLoading ? "Chargement des données…" : "Aucune donnée géographique disponible pour le moment."}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveVisitorMap;
