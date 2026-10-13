import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const keywords = "AgriCapital, investissement agricole Côte d’Ivoire, investissement foncier, plantation clé en main, plantation de palmier à huile, accès au foncier agricole, patrimoine agricole, actifs agricoles productifs, avec ou sans terre, Gonaté, Daloa, Haut-Sassandra, PalmInvest, TerraPalm, PalmTerroir, témoignages clients AgriCapital";

const PlantationCleEnMain = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEOHead
      title="Plantation clé en main & investissement agricole en Côte d’Ivoire | AgriCapital"
      description="AgriCapital accompagne vos projets agricoles et plantations de palmier à huile clé en main, avec ou sans terre. Une démarche transparente et un suivi documenté à Gonaté et Daloa."
      keywords={keywords}
    />
    <DynamicNavigation />
    <main className="pt-20">
      <section className="bg-primary text-primary-foreground">
        <div className="site-container py-16 sm:py-24">
          <p className="site-eyebrow !text-accent">AgriCapital · Côte d’Ivoire</p>
          <h1 className="site-title max-w-4xl !text-primary-foreground">Investissement agricole et plantation clé en main, avec ou sans terre</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-primary-foreground/80">
            AgriCapital développe une approche intégrée du projet agricole : valorisation du foncier, création de plantation et accompagnement dans la durée. Que vous disposiez déjà d’une terre ou que vous envisagiez un projet à partir de zéro, nous vous aidons à examiner une démarche adaptée à votre situation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/contact">Parler de mon projet <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"><Link to="/solutions">Découvrir les solutions</Link></Button>
          </div>
        </div>
      </section>

      <section className="site-container py-12 sm:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-border/70 bg-card p-6">
            <MapPin className="h-7 w-7 text-primary" />
            <h2 className="mt-4 text-xl font-bold">Le foncier au cœur du projet</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">L’accès à la terre et sa valorisation constituent des étapes importantes d’un projet agricole. AgriCapital privilégie une approche attentive à la situation foncière, au contexte du projet et à la clarté des engagements.</p>
            <Link className="mt-4 inline-flex font-semibold text-primary underline underline-offset-4" to="/tresor-foncier">Explorer le potentiel du foncier</Link>
          </article>
          <article className="rounded-2xl border border-border/70 bg-card p-6">
            <Sprout className="h-7 w-7 text-primary" />
            <h2 className="mt-4 text-xl font-bold">Plantation de palmier à huile clé en main</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Une vision d’ensemble relie préparation, mise en place de la plantation, coordination des opérations et suivi technique selon le périmètre convenu pour chaque projet.</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2"><Link className="font-semibold text-primary underline underline-offset-4" to="/palminvest">PalmInvest</Link><Link className="font-semibold text-primary underline underline-offset-4" to="/terrapalm">TerraPalm</Link><Link className="font-semibold text-primary underline underline-offset-4" to="/palmterroir">PalmTerroir</Link></div>
          </article>
          <article className="rounded-2xl border border-border/70 bg-card p-6">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h2 className="mt-4 text-xl font-bold">Transparence et suivi documenté</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">La confiance repose sur des engagements présentés clairement, un cadre contractuel compréhensible et une visibilité sur l’avancement du projet. Les modalités sont expliquées au fil des échanges, sans promesse uniforme ni résultat garanti.</p>
            <Link className="mt-4 inline-flex font-semibold text-primary underline underline-offset-4" to="/notre-approche">Comprendre notre approche</Link>
          </article>
        </div>
      </section>

      <section className="bg-secondary/35 py-12 sm:py-16">
        <div className="site-container grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="site-eyebrow">Ancrage local</p>
            <h2 className="site-title">AgriCapital à Gonaté, Daloa et dans le Haut-Sassandra</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">Notre présence à Gonaté, dans la zone de Daloa en Côte d’Ivoire, ancre notre démarche dans les réalités du terrain. Nous accompagnons la réflexion autour du foncier agricole, du palmier à huile et de la structuration de projets agricoles.</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">Chaque projet a son contexte. Notre rôle est de présenter les options et le cadre de collaboration avec clarté, afin que chacun puisse comprendre la démarche proposée avant d’aller plus loin.</p>
            <div className="mt-6 flex flex-wrap gap-4"><Link className="font-semibold text-primary underline underline-offset-4" to="/fondateur">Présentation du fondateur</Link><Link className="font-semibold text-primary underline underline-offset-4" to="/temoignages">Témoignages et présentation clients</Link><Link className="font-semibold text-primary underline underline-offset-4" to="/actualites">Actualités AgriCapital</Link></div>
          </div>
          <aside className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
            <h2 className="text-2xl font-bold">Une approche structurée, sans surpromesse</h2>
            <ul className="mt-5 space-y-3">{[
              "Comprendre votre objectif et votre situation foncière",
              "Présenter le périmètre et les engagements envisagés",
              "Clarifier les rôles et les modalités de collaboration",
              "Assurer un suivi adapté au projet et à son avancement",
            ].map(item => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span className="text-sm leading-relaxed">{item}</span></li>)}</ul>
            <Button asChild className="mt-7 w-full"><Link to="/contact">Échanger avec AgriCapital <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </aside>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default PlantationCleEnMain;
