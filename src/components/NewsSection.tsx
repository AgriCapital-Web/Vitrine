import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Newspaper, TrendingUp, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const tr={fr:{title:"Actualités",subtitle:"Ce qui se passe chez AgriCapital",more:"Toutes les actualités",evolution:"Voir l'évolution",read:"Lire la suite",views:"vues",featured:"À la une"},en:{title:"News",subtitle:"What is happening at AgriCapital",more:"All news",evolution:"See evolution",read:"Read more",views:"views",featured:"Featured"}} as const;

const NewsSection=()=>{
 const {language}=useLanguage(); const t=tr[language as keyof typeof tr]||tr.fr; const [active,setActive]=useState(0);
 const {data=[]}=useQuery({queryKey:["news-section"],queryFn:async()=>{const {data,error}=await supabase.from("news").select("*").eq("is_published",true).order("published_at",{ascending:false}).limit(6);if(error)throw error;return data||[];}});
 const articles=data as any[];
 const featured=articles.find(a=>a.is_featured)||articles[0];
 const images=useMemo(()=>{if(!featured)return[];const v=featured.images;const a=Array.isArray(v)?v:(typeof v==="string"?JSON.parse(v||"[]"):[]);return a.length?a:[featured.featured_image].filter(Boolean)},[featured]);
 useEffect(()=>{setActive(0)},[featured?.id]);
 useEffect(()=>{if(images.length<2)return;const id=window.setInterval(()=>setActive(i=>(i+1)%images.length),4500);return()=>window.clearInterval(id)},[images.length]);
 const title=(a:any)=>a?.[`title_${language}`]||a?.title_fr||a?.title||"";
 const excerpt=(a:any)=>a?.[`excerpt_${language}`]||a?.excerpt_fr||"";
 const date=(d:string)=>new Date(d).toLocaleDateString(language==="fr"?"fr-FR":"en-US",{day:"numeric",month:"short",year:"numeric"});
 if(!featured)return null;
 return <section id="actualites" className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
  <div className="container mx-auto px-4">
   <div className="flex items-end justify-between gap-4 mb-8"><div><Badge className="mb-3 bg-primary/15 text-primary border-0"><Newspaper className="w-4 h-4 mr-2"/>{t.title}</Badge><h2 className="text-3xl md:text-4xl font-bold">{t.subtitle}</h2></div><Link to="/new" className="hidden sm:flex items-center gap-2 text-primary font-medium">{t.more}<ArrowRight className="w-4 h-4"/></Link></div>
   <Link to={`/actualites/${featured.slug}`} className="group block rounded-lg overflow-hidden border bg-card shadow-sm hover:shadow-xl transition-all duration-500">
    <div className="grid lg:grid-cols-[1.2fr_.8fr] min-h-[420px]">
      <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-muted">
       {images[active]&&<img src={images[active]} alt={title(featured)} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.02]" onError={e=>e.currentTarget.src="/placeholder.jpeg"}/>}
       <div className="absolute inset-0 bg-gradient-to-t from-cinema/65 via-cinema/10 to-transparent"/>
       <div className="absolute left-5 right-5 bottom-5 flex items-end justify-between gap-4 text-cinema-foreground"><Badge className="bg-cinema/45 text-cinema-foreground border-cinema-foreground/20">{t.featured}</Badge><span className="text-sm">{active+1}/{Math.max(images.length,1)}</span></div>
       {images.length>1&&<div className="absolute top-1/2 -translate-y-1/2 inset-x-3 flex justify-between pointer-events-none"><button aria-label="Previous" className="pointer-events-auto rounded-full bg-cinema/45 text-cinema-foreground p-2" onClick={e=>{e.preventDefault();e.stopPropagation();setActive(i=>(i-1+images.length)%images.length)}}><ChevronLeft/></button><button aria-label="Next" className="pointer-events-auto rounded-full bg-cinema/45 text-cinema-foreground p-2" onClick={e=>{e.preventDefault();e.stopPropagation();setActive(i=>(i+1)%images.length)}}><ChevronRight/></button></div>}
      </div>
      <div className="p-7 md:p-10 flex flex-col justify-center">
       <div className="flex items-center gap-3 text-sm text-muted-foreground mb-5"><Calendar className="w-4 h-4"/>{date(featured.published_at||featured.created_at)}{featured.views_count>0&&<><Eye className="w-4 h-4 ml-2"/>{featured.views_count} {t.views}</>}</div>
       <h3 className="text-2xl md:text-4xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors">{title(featured)}</h3>
       <p className="text-muted-foreground leading-relaxed line-clamp-4">{excerpt(featured)||String(featured.content_fr||"").replace(/<[^>]+>/g," ").slice(0,260)}</p>
       <span className="mt-7 inline-flex items-center gap-2 text-primary font-semibold">{t.read}<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1"/></span>
      </div>
    </div>
   </Link>
   {articles.length>1&&<div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{articles.filter(a=>a.id!==featured.id).slice(0,3).map((a:any)=><Link key={a.id} to={`/actualites/${a.slug}`} className="group rounded-lg overflow-hidden border bg-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300"><div className="aspect-[16/9] overflow-hidden bg-muted"><img src={a.featured_image||((Array.isArray(a.images)&&a.images[0])||"/placeholder.jpeg")} alt={title(a)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div><div className="p-5"><p className="text-xs text-muted-foreground mb-2">{date(a.published_at||a.created_at)}</p><h4 className="font-semibold line-clamp-2 group-hover:text-primary">{title(a)}</h4></div></Link>)}</div>}
   <div className="flex flex-wrap justify-center gap-3 mt-8 sm:hidden"><Button asChild><Link to="/new">{t.more}</Link></Button><Button asChild variant="outline"><Link to="/evolution">{t.evolution}</Link></Button></div>
  </div>
 </section>;
};
export default NewsSection;
