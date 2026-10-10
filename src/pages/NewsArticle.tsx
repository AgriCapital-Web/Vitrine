import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ArticleJsonLD from "@/components/ArticleJsonLD";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Calendar, ArrowLeft, Share2, User, Eye, Loader2, ChevronLeft, ChevronRight, X,
  Facebook, Twitter, Linkedin, MessageCircle, Copy, Clock3, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();
  const fr = language === "fr";
  const [view, setView] = useState(0);
  const [shares, setShares] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article-v2", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").eq("slug", slug).eq("is_published", true).single();
      if (error) return null;
      return data;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["news-related-v2", article?.id, article?.category],
    enabled: !!article,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .neq("id", article.id)
        .eq("category", article.category || "general")
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) return [];
      return data || [];
    },
  });

  const images = useMemo(() => {
    if (!article) return [];
    try {
      const value = Array.isArray(article.images) ? article.images : JSON.parse(article.images || "[]");
      return value.length ? value : [article.featured_image].filter(Boolean);
    } catch {
      return [article.featured_image].filter(Boolean);
    }
  }, [article]);

  const videos = useMemo(() => {
    if (!article) return [];
    try {
      return Array.isArray(article.videos) ? article.videos : JSON.parse(article.videos || "[]");
    } catch {
      return [];
    }
  }, [article]);

  const title = (field: string, item: any = article) =>
    item?.[`${field}_${language}`] || item?.[`${field}_fr`] || item?.[field] || "";

  // Keep every hook before conditional returns. This prevents a hook-order crash
  // when an article changes from loading to loaded on the first visit.
  const content = title("content");
  const extractedHashtags = useMemo(() => {
    const source = String(content || "");
    const matches = source.match(/#[\\p{L}\\p{N}_-]+/gu) || [];
    return [...new Set(matches)];
  }, [content]);

  const seoTitle = article?.meta_title || title("title");
  const seoDescription = article?.meta_description || title("excerpt") || String(title("content") || "")
    .replace(/<[^>]+>/g, " ").replace(/#\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 220);

  const excerpt = title("excerpt") || String(title("content") || "")
    .replace(/<[^>]+>/g, " ").replace(/#\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 220);

  const articleUrl = `https://www.agricapital.ci/new/${article?.slug || slug}`;

  const date = (value: string) =>
    new Date(value).toLocaleDateString(fr ? "fr-FR" : "en-US", {
      day: "numeric", month: "long", year: "numeric",
    });

  const readingTime = Math.max(
    2,
    Math.round(String(article?.content_fr || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).length / 210)
  );

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const article = document.querySelector(".news-prose");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const total = Math.max(article.clientHeight - window.innerHeight, 1);
      setReadingProgress(Math.min(100, Math.max(0, (-rect.top / total) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [article]);

  useEffect(() => {
    if (!article) return;
    setView(article.views_count || 0);
    setShares(article.shares_count || 0);
    const key = `news-viewed:${article.id}`;
    if (sessionStorage.getItem(key)) return;
    (async () => {
      try {
        sessionStorage.setItem(key, "1");
        const { data } = await supabase.rpc("increment_news_view", { p_news_id: article.id });
        if (typeof data === "number") setView(data);
      } catch {
        sessionStorage.removeItem(key);
      }
    })();
  }, [article]);

  useEffect(() => {
    if (images.length < 2) return;
    const id = window.setInterval(() => setGalleryIndex((i) => (i + 1) % images.length), 6500);
    return () => window.clearInterval(id);
  }, [images.length]);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const id = window.requestAnimationFrame(() => {
      const root = document.querySelector(".news-prose");
      if (!root) return;
      const nodes = Array.from(root.children) as HTMLElement[];
      nodes.forEach((node, index) => {
        node.classList.add("article-reveal");
        node.style.setProperty("--article-index", String(Math.min(index, 16)));
        window.setTimeout(() => node.classList.add("is-visible"), Math.min(index, 16) * 115);
      });
      observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer?.unobserve(entry.target);
          }
        }),
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      nodes.forEach((node) => observer?.observe(node));
    });
    return () => {
      window.cancelAnimationFrame(id);
      observer?.disconnect();
    };
  }, [article, language]);

  if (isLoading) {
    return <><DynamicNavigation /><main className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></main><Footer /></>;
  }

  if (!article) {
    return <>
      <SEOHead />
      <DynamicNavigation />
      <main className="min-h-screen pt-36 text-center px-4">
        <p className="newsroom-kicker justify-center"><span />AgriCapital</p>
        <h1 className="mt-4 text-3xl font-black">{fr ? "Article non trouvé" : "Article not found"}</h1>
        <p className="mt-3 text-muted-foreground">{fr ? "Cette publication n'existe pas ou a été déplacée." : "This publication does not exist or has moved."}</p>
        <Button asChild className="mt-7"><Link to="/new"><ArrowLeft className="mr-2 h-4 w-4" />{t.news?.backToNews || (fr ? "Retour aux actualités" : "Back to newsroom")}</Link></Button>
      </main>
      <Footer />
    </>;
  }

  const parsed = content.includes("<p") || content.includes("<h2") || content.includes("<figure")
    ? content
    : content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>");

  const cleanEditorialHtml = parsed
    .replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (block, inner) => {
      const plain = String(inner).replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").trim();
      if (plain && /^(?:#\S+\s*)+$/.test(plain)) return "";
      return block;
    })
    .replace(/(^|\s)#[\p{L}\p{N}_-]+(?=\s|<|$)/gu, "$1");

  const safeHtml = DOMPurify.sanitize(cleanEditorialHtml, {
    ALLOWED_TAGS: [
      "p","h2","h3","h4","strong","em","br","hr","li","ul","ol","a","blockquote",
      "table","thead","tbody","tr","th","td","img","figure","figcaption","span"
    ],
    ALLOWED_ATTR: [
      "class","href","src","alt","target","rel","style","loading","width","height"
    ],
  });

  const previous = () => setGalleryIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setGalleryIndex((i) => (i + 1) % images.length);

  const registerShare = async () => {
    try {
      const { data } = await supabase.rpc("increment_news_share", { p_news_id: article.id });
      if (typeof data === "number") setShares(data);
    } catch {}
  };

  const fb = () => { registerShare(); window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, "_blank", "width=600,height=500"); };
  const x = () => { registerShare(); window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(title("title"))}`, "_blank", "width=600,height=500"); };
  const li = () => { registerShare(); window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, "_blank", "width=600,height=500"); };
  const wa = () => { registerShare(); window.open(`https://wa.me/?text=${encodeURIComponent(articleUrl)}`, "_blank"); };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      await registerShare();
      toast.success(fr ? "Lien officiel copié" : "Official link copied");
    } catch {
      toast.error(fr ? "Impossible de copier le lien" : "Unable to copy the link");
    }
  };

  return <>
    <SEOHead type="article" title={seoTitle} description={seoDescription} image={article.featured_image || images[0]} />
    <ArticleJsonLD
      type="NewsArticle"
      headline={seoTitle}
      description={seoDescription}
      image={article.featured_image || images[0]}
      datePublished={article.published_at || article.created_at}
      dateModified={article.updated_at || article.published_at || article.created_at}
      path={`/new/${article.slug}`}
      section={article.category || "Actualité"}
      breadcrumbs={[
        { name: fr ? "Actualités" : "News", path: "/new" },
        { name: title("title"), path: `/new/${article.slug}` }
      ]}
      keywords={article.focus_keyword ? [article.focus_keyword] : []}
    />

    <DynamicNavigation />
    <div className="news-reading-progress" style={{ width: `${readingProgress}%` }} aria-hidden="true" />

    <main className="news-article-page min-h-screen overflow-x-hidden pt-[72px]">
      <section className="site-container pt-5 sm:pt-7 lg:pt-9">
        {images.length > 0 ? (
          <div
            className="article-cinematic-hero group"
            onClick={() => setGalleryOpen(true)}
          >
            <img
              key={images[galleryIndex]}
              src={images[galleryIndex]}
              alt={title("title")}
              className="article-cinematic-hero-image"
              onError={(e) => { e.currentTarget.src = "/placeholder.jpeg"; }}
            />
            <div className="article-cinematic-hero-shade" />
            <div className="article-cinematic-hero-top">
              <Link
                to="/new"
                className="article-glass-control inline-flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowLeft className="h-4 w-4" />
                {t.news?.backToNews || (fr ? "Retour aux actualités" : "Back to newsroom")}
              </Link>
              <span className="article-glass-control hidden sm:inline-flex">
                {article.category || "Actualité"}
              </span>
            </div>
            <div className="article-cinematic-hero-content">
              <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-[.16em] text-white/85 sm:text-xs">
                <span>{article.category || "Actualité"}</span>
                <span className="text-white/45">•</span>
                <span>{date(article.published_at || article.created_at)}</span>
                <span className="text-white/45">•</span>
                <span>{readingTime} {fr ? "min de lecture" : "min read"}</span>
              </div>
              <h1 className="article-cinematic-title mt-4 max-w-[1500px] text-white">
                {title("title")}
              </h1>
              <p className="article-cinematic-excerpt mt-4 max-w-3xl text-white/85">
                {excerpt}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
                <span className="inline-flex items-center gap-2"><User className="h-4 w-4" />{article.author || "AgriCapital"}</span>
                <span className="inline-flex items-center gap-2"><Eye className="h-4 w-4" />{view} {fr ? "vues" : "views"}</span>
                {shares > 0 && <span className="inline-flex items-center gap-2"><Share2 className="h-4 w-4" />{shares} {fr ? "partages" : "shares"}</span>}
              </div>
              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  aria-label={fr ? "Partager l'article" : "Share article"}
                  className="article-glass-control"
                  onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}
                >
                  <Share2 className="h-4 w-4" />
                  <span>{fr ? "Partager" : "Share"}</span>
                </button>
                {images.length > 1 && (
                  <div className="article-glass-control">
                    <span>{galleryIndex + 1} / {images.length}</span>
                  </div>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-5 right-5 z-20 hidden gap-2 sm:flex">
                <button aria-label="Précédent" className="article-glass-icon" onClick={(e) => { e.stopPropagation(); previous(); }}><ChevronLeft className="h-5 w-5" /></button>
                <button aria-label="Suivant" className="article-glass-icon" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight className="h-5 w-5" /></button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 p-8">
            <Link to="/new" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />{t.news?.backToNews || (fr ? "Retour aux actualités" : "Back to newsroom")}
            </Link>
            <h1 className="mt-6 text-4xl font-black">{title("title")}</h1>
          </div>
        )}

        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((img: string, i: number) => (
              <button key={`${img}-${i}`} onClick={() => setGalleryIndex(i)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${i === galleryIndex ? "border-accent" : "border-transparent opacity-65"}`}>
                <img src={img} alt={`${title("title")} — ${i + 1}`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.jpeg"; }} />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="site-container grid gap-8 pb-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start lg:justify-between lg:pb-16 article-story-shell">
        <article className="news-prose min-w-0" dangerouslySetInnerHTML={{ __html: safeHtml }} />
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl border border-border/70 bg-card p-5">
            <p className="text-[11px] font-black uppercase tracking-[.16em] text-accent">{t.news?.share || (fr ? "Partager" : "Share")}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{fr ? "Faites circuler cette publication." : "Share this publication."}</p>
            <Button className="mt-4 w-full" onClick={() => setShareOpen(true)}><Share2 className="mr-2 h-4 w-4" />{fr ? "Partager" : "Share"}</Button>
          </div>
        </aside>
      </section>

      {extractedHashtags.length > 0 && (
        <section className="site-container pb-10">
          <div className="article-hashtags">
            {extractedHashtags.map((tag) => (
              <Link key={tag} to="/new" className="article-hashtag">{tag}</Link>
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="site-container pb-14">
          <div className="border-t border-border/70 pt-10">
            <p className="newsroom-kicker"><span />{fr ? "À voir" : "Watch"}</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {videos.map((video: string, i: number) => (
                <video key={i} controls preload="metadata" poster={images[0]} className="w-full max-h-[70vh] rounded-2xl bg-black shadow-lg">
                  <source src={video} />
                </video>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="site-container border-t border-border/70 py-14 sm:py-20">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="newsroom-kicker"><span />{fr ? "Le nouveau" : "The newsroom"}</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{fr ? "À lire ensuite" : "Read next"}</h2>
            </div>
            <Link to="/new" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-primary">{fr ? "Voir tout" : "View all"}<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item: any) => {
              const itemImages = (() => { try { const x = Array.isArray(item.images) ? item.images : JSON.parse(item.images || "[]"); return x.length ? x : [item.featured_image].filter(Boolean); } catch { return [item.featured_image].filter(Boolean); } })();
              return (
                <Link key={item.id} to={`/new/${item.slug}`} className="group min-w-0">
                  <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
                    <img src={itemImages[0] || "/placeholder.jpeg"} alt={title("title", item)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" onError={(e) => { e.currentTarget.src = "/placeholder.jpeg"; }} />
                  </div>
                  <p className="mt-4 text-[11px] font-black uppercase tracking-[.14em] text-accent">{item.category || "Actualité"}</p>
                  <h3 className="mt-2 text-xl font-extrabold leading-tight group-hover:text-primary">{title("title", item)}</h3>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>

    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
      <DialogContent className="max-w-sm">
        <h3 className="text-lg font-bold">{fr ? "Partager l'article" : "Share article"}</h3>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={fb}><Facebook className="mr-2 h-4 w-4" />Facebook</Button>
          <Button variant="outline" onClick={x}><Twitter className="mr-2 h-4 w-4" />X</Button>
          <Button variant="outline" onClick={li}><Linkedin className="mr-2 h-4 w-4" />LinkedIn</Button>
          <Button variant="outline" onClick={wa}><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</Button>
        </div>
        <Button variant="secondary" className="mt-3 w-full" onClick={copy}><Copy className="mr-2 h-4 w-4" />{fr ? "Copier le lien officiel" : "Copy official link"}</Button>
      </DialogContent>
    </Dialog>

    <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
      <DialogContent className="max-w-[96vw] max-h-[96vh] border-0 bg-black/95 p-2">
        <div className="relative flex min-h-[65vh] items-center justify-center">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10 text-white" onClick={() => setGalleryOpen(false)}><X /></Button>
          {images.length > 1 && <>
            <Button variant="ghost" size="icon" className="absolute left-2 z-10 text-white" onClick={previous}><ChevronLeft className="h-8 w-8" /></Button>
            <Button variant="ghost" size="icon" className="absolute right-2 z-10 text-white" onClick={next}><ChevronRight className="h-8 w-8" /></Button>
          </>}
          <img src={images[galleryIndex]} alt={`${title("title")} — ${galleryIndex + 1}`} className="max-h-[88vh] max-w-full object-contain" onError={(e) => { e.currentTarget.src = "/placeholder.jpeg"; }} />
        </div>
      </DialogContent>
    </Dialog>

    <Footer />
  </>;
};

export default NewsArticle;
