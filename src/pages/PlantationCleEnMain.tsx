import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Sprout, Tractor } from "lucide-react";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const PlantationCleEnMain = () => (
  <div className="public-page min-h-screen">
    <Helmet>
      <title>Plantation clé en main en Côte d’Ivoire | AgriCapital</title>
      <meta name="description" content="De l’accès au foncier sécurisé à la plantation clé en main, AgriCapital accompagne vos projets agricoles avec ou sans terre à Gonaté, Daloa et dans le Haut-Sassandra." />
      <meta name="keywords" content="plantation clé en main, plantation agricole clé en main, plantation palmier à huile, accès au foncier sécurisé, investissement agricole Côte d’Ivoire, avec ou sans terre, Gonaté, Daloa, Haut-Sassandra, AgriCapital, PalmInvest, TerraPalm, PalmTerroir" />
      <link rel="canonical" href="https://www.agricapital.ci/plantation-cle-en-main" />
      <meta property="og:title" content="Plantation clé en main avec ou sans terre | AgriCapital" />
      <meta property="og:description" content="Accès au foncier sécurisé et accompagnement de plantations de palmier à huile en Côte d’Ivoire, avec ou sans terre." />
      <meta property="og:url" content="https://www.agricapital.ci/plantation-cle-en-main" />
      <meta property="og:image" content="https://www.agricapital.ci/og-image.png" />
    </Helmet>
    <DynamicNavigation />
    <main className="pt-[72px]">
      <section className="bg-primary text-primary-foreground">
        <div className="site-container py-16 sm:py-24">
          <p className="mb-4 text-sm font-bold uppercase tracking-[.18em] text-accent">AgriCapital · Côte d’Ivoire</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl">Plantation clé en main : avec ou sans terre</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-primary-foreground/85">AgriCapital accompagne les porteurs de projets agricoles depuis la réflexion foncière jusqu’à la création et au suivi d’une plantation de palmier à huile. Selon votre situation, vous pouvez déjà disposer d’un terrain ou rechercher une solution d’accès au foncier à étudier et à sécuriser avant tout engagement.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/contact">Étudier mon projet <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"><Link to="/solutions">Comparer nos solutions</Link></Button>
          </div>
        </div>
      </section>
      <section className="site-container py-12 sm:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-card p-6">
            <MapPin className="h-7 w-7 text-primary" /><h2 className="mt-4 text-xl font-bold">Sans terre : étudier l’accès au foncier</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Pour les personnes qui ne possèdent pas encore de terre, l’étude porte sur la disponibilité, la localisation, les documents fonciers et les vérifications nécessaires. Aucun terrain ne doit être considéré comme sécurisé avant ces contrôles.</p>
            <Link className="mt-4 inline-flex font-semibold text-primary underline underline-offset-4" to="/palminvest">Découvrir PalmInvest</Link>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6">
            <ShieldCheck className="h-7 w-7 text-primary" /><h2 className="mt-4 text-xl font-bold">Avec votre propre terre</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Pour les propriétaires, le projet peut commencer par l’analyse du terrain, l’organisation de la parcelle, la préparation du projet de plantation et la définition du suivi technique adapté.</p>
            <Link className="mt-4 inline-flex font-semibold text-primary underline underline-offset-4" to="/terrapalm">Découvrir TerraPalm</Link>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6">
            <Sprout className="h-7 w-7 text-primary" /><h2 className="mt-4 text-xl font-bold">Créer et suivre la plantation</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Selon l’offre retenue, l’accompagnement peut couvrir la préparation, la mise en place, les pratiques agronomiques, le suivi de l’évolution et l’organisation des opérations sur le terrain.</p>
            <Link className="mt-4 inline-flex font-semibold text-primary underline underline-offset-4" to="/palmterroir">Découvrir PalmTerroir</Link>
          </article>
        </div>
      </section>
      <section className="bg-secondary/40 py-12 sm:py-16">
        <div className="site-container grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <div><p className="site-eyebrow">Notre démarche</p><h2 className="site-title">Du foncier au suivi agricole, une démarche structurée</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">Une plantation clé en main ne se résume pas à planter. Le projet doit tenir compte du terrain, de la faisabilité, des besoins en plants et intrants, de l’organisation des travaux et du suivi dans la durée. Les étapes et les conditions sont précisées au cas par cas avant engagement.</p>
            <ul className="mt-6 space-y-3">{["Échange initial sur vos objectifs et votre situation foncière","Étude des besoins et des vérifications préalables","Définition du périmètre, du calendrier et des responsabilités","Mise en place du projet et accompagnement technique selon l’offre retenue"].map(item => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span>{item}</span></li>)}</ul>
          </div>
          <aside className="rounded-2xl border border-border bg-card p-6 sm:p-8"><Tractor className="h-8 w-8 text-primary" /><h2 className="mt-4 text-2xl font-bold">AgriCapital à Gonaté et Daloa</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">AgriCapital est implantée à Gonaté, dans la zone de Daloa, au sein du Haut-Sassandra en Côte d’Ivoire. Cette présence de terrain s’inscrit dans notre accompagnement des projets agricoles et du foncier dans la région.</p>
            <p className="mt-3 leading-relaxed text-muted-foreground">Vous recherchez une plantation de palmier à huile clé en main à Gonaté, Daloa ou ailleurs en Côte d’Ivoire ? Contactez-nous pour décrire votre projet et vérifier les options réellement disponibles.</p>
            <Button asChild className="mt-6 w-full"><Link to="/contact">Contacter AgriCapital <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </aside>
        </div>
      </section>
      <section className="site-container py-12 sm:py-16">
        <h2 className="site-title">Questions fréquentes sur la plantation clé en main</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article><h3 className="text-lg font-bold">Peut-on lancer un projet sans posséder de terre ?</h3><p className="mt-2 leading-relaxed text-muted-foreground">Oui, une étude peut être engagée sans terrain déjà détenu. La disponibilité foncière, les documents et la sécurisation du terrain doivent toutefois être vérifiés avant toute décision ou contractualisation.</p></article>
          <article><h3 className="text-lg font-bold">Puis-je faire développer une plantation sur mon terrain ?</h3><p className="mt-2 leading-relaxed text-muted-foreground">Oui, les propriétaires peuvent présenter leur parcelle pour examiner sa situation et les besoins du projet. La faisabilité et les modalités d’accompagnement sont évaluées au cas par cas.</p></article>
          <article><h3 className="text-lg font-bold">Où se trouve AgriCapital ?</h3><p className="mt-2 leading-relaxed text-muted-foreground">AgriCapital est présente à Gonaté, dans la zone de Daloa, région du Haut-Sassandra en Côte d’Ivoire.</p></article>
          <article><h3 className="text-lg font-bold">La rentabilité est-elle garantie ?</h3><p className="mt-2 leading-relaxed text-muted-foreground">Aucun projet agricole ne doit être présenté comme sans risque. Les rendements, délais et coûts dépendent notamment du terrain, de la conduite culturale, des conditions climatiques et du cadre contractuel.</p></article>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);
export default PlantationCleEnMain;
