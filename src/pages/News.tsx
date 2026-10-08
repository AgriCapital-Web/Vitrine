import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, Search, Clock3, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

const News = () => {
  const { language, t } = useLanguage();
  const fr = language === "fr";
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const labels = fr
    ? {
        kicker: "Le fil AgriCapital",
        title: "Actualités & terrain",
        intro: "Les étapes, décisions, opérations et perspectives qui racontent la construction d’AgriCapital, au plus près du terrain.",
        all: "Toutes",
        featured: "À la une",
        latest: "Dernières publications",
        read: "Lire l’article",
        search: "Rechercher une actualité…",
        min: "min de lecture",
        noResult: t.news?.noNews || "Aucune publication ne correspond à votre recherche.",
      }
    : {
        kicker: "AgriCapital newsroom",
        title: "News & field",
        intro: "Operations, decisions, progress and perspectives from AgriCapital’s work on the ground.",
        all: "All",
        featured: "Featured",
        latest: "Latest publications",
        read: "Read article",
        search: "Search the newsroom…",
        min: "min read",
        noResult: "No publication matches your search.",
      };

  const { data = [], isLoading } = useQuery({
    queryKey: ["news-page-v4"],
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(80);
      if (error) throw error;
      return data || [];
    },
  });

  const title = (a: any) => a?.[`title_${language}`] || a?.title_fr || a?.title || "";
  const excerpt = (a: any) =>
    a?.[`excerpt_${language}`] || a?.meta_description || a?.excerpt_fr ||
    String(a?.content_fr || "").replace(/<[^>]+>/g, " ").replace(/#\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 240);

  const images = (a: any): string[] => {
    try {
      const parsed = Array.isArray(a?.images) ? a.images : JSON.parse(a?.images || "[]");
      return parsed.length ? parsed : [a?.featured_image].filter(Boolean);
    } catch { return [a?.featured_image].filter(Boolean); }
  };

  const readingTime = (a: any) => {
    const text = String(a?.content_fr || "").replace(/<[^>]+>/g, " ");
    return Math.max(2, Math.round(text.trim().split(/\s+/).length / 210));
  };

  const date = (value: string) => new Date(value).toLocaleDateString(fr ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" });

  const categories = useMemo(() => ["all", ...Array.from(new Set((data as any[]).map((a) => a.category).filter(Boolean)))], [data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data as any[]).filter((a) => {
      const haystack = [title(a), excerpt(a), a.category].join(" ").toLowerCase();
      return (category === "all" || a.category === category) && (!q || haystack.includes(q));
    });
  }, [data, category, query, language]);

  const featured = filtered[0];
  const remaining = featured ? filtered.slice(1) : [];

  return (
    <>
      <SEOHead title={fr ? "Actualités AgriCapital" : "AgriCapital News"} description={labels.intro} />
      <DynamicNavigation />

      <main className="newsroom-page min-h-screen overflow-x-hidden pt-[72px]">
        <header className="newsroom-masthead">
          <div className="site-container py-12 sm:py-16 lg:py-20">
            <div className="max-w-4xl">
              <p className="newsroom-kicker"><span />{labels.kicker}</p>
              <h1 className="newsroom-main-title mt-4">{labels.title}</h1>
              <p className="newsroom-main-intro mt-5">{labels.intro}</p>
            </div>
          </div>
        </header>

        <section className="site-container py-8 sm:py-10">
          <div className="newsroom-toolbar">
            <div className="flex min-w-0 gap-2 overflow-x-auto scrollbar-none">
              {categories.map((item) => (
                <button key={item} onClick={() => setCategory(item)} className={`newsroom-filter ${category === item ? "is-active" : ""}`}>
                  {item === "all" ? labels.all : item}
                </button>
              ))}
            </div>
            <label className="newsroom-search">
              <Search className="h-4 w-4 shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={labels.search} aria-label={labels.search} />
            </label>
          </div>
        </section>

        {isLoading ? (
          <section className="site-container pb-16"><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[330px] animate-pulse rounded-2xl bg-muted" />)}</div></section>
        ) : filtered.length ? (
          <>
            {featured && (
              <section className="site-container pb-12 sm:pb-16">
                <Link to={`/new/${featured.slug}`} className="newsroom-feature group">
                  <div className="newsroom-feature-media">
                    <img src={images(featured)[0] || "/placeholder.jpeg"} alt={title(featured)} onError={(e) => { e.currentTarget.src = "/placeholder.jpeg"; }} />
                    <div className="newsroom-feature-shade" />
                    <div className="newsroom-feature-label">{labels.featured}</div>
                  </div>
                  <div className="newsroom-feature-copy">
                    <div className="newsroom-meta"><span>{featured.category || "Actualité"}</span><i /> <span>{date(featured.published_at || featured.created_at)}</span><i /> <span><Clock3 className="inline h-3.5 w-3.5" /> {readingTime(featured)} {labels.min}</span></div>
                    <h2>{title(featured)}</h2>
                    <p>{excerpt(featured)}</p>
                    <span className="newsroom-readmore">{labels.read}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              </section>
            )}

            <section className="site-container pb-16 sm:pb-20">
              <div className="newsroom-section-heading">
                <div><p className="newsroom-kicker"><span />{labels.latest}</p></div>
                <span className="text-sm text-muted-foreground">{filtered.length} {fr ? "publication(s)" : "publication(s)"}</span>
              </div>

              <div className="newsroom-grid mt-7">
                {remaining.map((article: any) => (
                  <Link key={article.id} to={`/new/${article.slug}`} className="newsroom-card group">
                    <div className="newsroom-card-media">
                      <img src={images(article)[0] || "/placeholder.jpeg"} alt={title(article)} onError={(e) => { e.currentTarget.src = "/placeholder.jpeg"; }} />
                      <span className="newsroom-card-category">{article.category || "Actualité"}</span>
                    </div>
                    <div className="newsroom-card-body">
                      <div className="newsroom-meta"><span>{date(article.published_at || article.created_at)}</span><i /><span>{readingTime(article)} {labels.min}</span></div>
                      <h2>{title(article)}</h2>
                      <p>{excerpt(article)}</p>
                      <span className="newsroom-readmore">{labels.read}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="site-container pb-20"><div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground"><Newspaper className="mx-auto mb-3 h-8 w-8 opacity-50" />{labels.noResult}</div></section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default News;
