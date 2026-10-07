import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Calendar, ArrowRight, Search, Clock3, Newspaper, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const News = () => {
  const { language, t } = useLanguage();
  const fr = language === "fr";
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const labels = fr
    ? {
        kicker: "Actualités",
        title: "AgriCapital — Actualités",
        intro: "Les opérations, décisions, avancées et publications qui témoignent de la construction d’AgriCapital sur le terrain.",
        all: "Tout",
        featured: "À la une",
        latest: "Dernières publications",
        read: "Lire l'article",
        search: "Rechercher une actualité...",
        min: "min de lecture",
        noResult: t.news?.noNews || "Aucune publication ne correspond à votre recherche.",
      }
    : {
        kicker: "News",
        title: "AgriCapital — News",
        intro: "Operations, decisions, progress and publications from AgriCapital’s work on the ground.",
        all: "All",
        featured: "Featured",
        latest: "Latest publications",
        read: "Read article",
        search: "Search the newsroom...",
        min: "min read",
        noResult: "No publication matches your search.",
      };

  const { data = [], isLoading } = useQuery({
    queryKey: ["news-page-v3"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data || [];
    },
  });

  const title = (a: any) => a?.[`title_${language}`] || a?.title_fr || a?.title || "";
  const excerpt = (a: any) =>
    a?.[`excerpt_${language}`] ||
    a?.meta_description ||
    a?.excerpt_fr ||
    String(a?.content_fr || "").replace(/<[^>]+>/g, " ").replace(/#\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 260);

  const images = (a: any): string[] => {
    try {
      const parsed = Array.isArray(a?.images) ? a.images : JSON.parse(a?.images || "[]");
      return parsed.length ? parsed : [a?.featured_image].filter(Boolean);
    } catch {
      return [a?.featured_image].filter(Boolean);
    }
  };

  const readingTime = (a: any) => {
    const text = String(a?.content_fr || "").replace(/<[^>]+>/g, " ");
    return Math.max(2, Math.round(text.trim().split(/\s+/).length / 210));
  };

  const date = (value: string) =>
    new Date(value).toLocaleDateString(fr ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const categories = useMemo(
    () => ["all", ...Array.from(new Set((data as any[]).map((a) => a.category).filter(Boolean)))],
    [data]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data as any[]).filter((a) => {
      const matchesCategory = category === "all" || a.category === category;
      const haystack = [title(a), excerpt(a), a.category].join(" ").toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [data, category, query, language]);


  return (
    <>
      <SEOHead title={fr ? "Actualités AgriCapital" : "AgriCapital News"} description={labels.intro} />
      <DynamicNavigation />

      <main className="newsroom-page min-h-screen overflow-x-hidden pt-[72px]">
        <section className="border-b border-border/60 bg-[linear-gradient(180deg,hsl(var(--primary)/.06),transparent)]">
          <div className="site-container py-12 sm:py-16">
            <p className="newsroom-kicker"><span />{labels.kicker}</p>
            <h1 className="news-page-title mt-4 max-w-6xl text-[clamp(1.75rem,3.4vw,3.6rem)] font-black leading-[1.04] tracking-[-.04em] text-foreground">
              {labels.title}
            </h1>
          </div>
        </section>

        <section className="site-container py-8 sm:py-10 lg:py-12">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-[360px] animate-pulse rounded-2xl bg-muted" />)}</div>
          ) : filtered.length ? (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((article: any) => (
                <Link key={article.id} to={`/new/${article.slug}`} className="group block min-w-0 rounded-2xl border border-border/60 bg-card p-3 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-medium">
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted"><img src={images(article)[0] || "/placeholder.jpeg"} alt={title(article)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" /></div>
                  <div className="px-2 pb-2 pt-4">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-accent"><span>{article.category || "Actualité"}</span><span className="text-border">•</span><span>{date(article.published_at || article.created_at)}</span><span className="text-border">•</span><span>{readingTime(article)} {labels.min}</span></div>
                    <h2 className="news-card-title mt-3 text-[15px] font-extrabold leading-[1.2] tracking-[-.018em] text-foreground transition-colors group-hover:text-primary sm:text-[17px]">{title(article)}</h2>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">{excerpt(article)}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">{labels.read}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground"><Newspaper className="mx-auto mb-3 h-8 w-8 opacity-50" />{labels.noResult}</div>}
        </section>

        <section className="site-container pb-8">
          <div className="flex flex-col gap-4 border-y border-border/70 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
                    category === item
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/70 bg-card/70 hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  {item === "all" ? labels.all : item}
                </button>
              ))}
            </div>
            <label className="flex h-11 w-full items-center gap-2 rounded-full border border-border/70 bg-card/90 px-4 shadow-sm lg:w-[330px]">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={labels.search}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
};

export default News;
