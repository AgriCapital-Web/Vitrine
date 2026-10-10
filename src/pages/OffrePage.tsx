import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, CheckCircle2, Leaf, MapPinned, ShieldCheck, Sprout, Timer, Users,
} from "lucide-react";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ContactCTA, { contactCtaLabel } from "@/components/ContactCTA";
import terraPalmHero from "@/assets/palm-mature-fruits.jpg";
import palmTerroirHero from "@/assets/palm-mature-plantation.jpg";

export type OffreKey = "palminvest" | "terrapalm" | "palmterroir";

const OFFERS = {
  palminvest: {
    name: "PalmInvest",
    eyebrow: "Pour les clients sans foncier",
    title: "Devenez propriétaire d'une plantation de palmier à huile, sans disposer de terre.",
    intro:
      "AgriCapital sécurise le foncier et crée pour vous une plantation de palmier à huile clé en main, remise productive à 40 mois.",
    image: "/plantation-cle-main-portrait.webp",
    alt: "Remise d'une plantation clé en main PalmInvest par l'équipe AgriCapital",
    highlights: [
      { icon: MapPinned, title: "Accès au foncier sécurisé", desc: "Accès à une parcelle préparée pour la mise en place du projet." },
      { icon: Sprout, title: "Plantation créée clé en main", desc: "Création de la plantation selon les caractéristiques du foncier et le parcours retenu." },
      { icon: Timer, title: "Encadrement technique", desc: "Accompagnement technique du développement de la plantation." },
      { icon: ShieldCheck, title: "Facilitation de l’écoulement de la production dans la durée", desc: "Facilitation de l’accès aux débouchés de la filière selon les conditions de l’offre." },
    ],
    variants: [
      {
        name: "PalmInvest",
        desc: "Vous reprenez la gestion de votre plantation après la remise.",
        points: ["Gestion autonome après remise", "Suivi agronomique et fourniture d'intrants", "Accès au portail client digital"],
      },
      {
        name: "PalmInvest+",
        desc: "AgriCapital gère intégralement votre plantation pour vous.",
        points: ["Gestion entièrement déléguée", "Entretien, récolte et commercialisation pris en charge", "Rapports et informations de suivi"],
      },
    ],
  },
  palmterroir: {
    name: "PalmTerroir",
    eyebrow: "Pour les clients disposant d'une parcelle",
    title: "Créez votre plantation de palmier à huile à partir de votre parcelle.",
    intro:
      "AgriCapital vous facilite la création d'une plantation de palmier à huile productive.",
    image: palmTerroirHero,
    alt: "Jeunes plants de palmier à huile en pépinière pour une mise en place de plantation",
    highlights: [
      { icon: MapPinned, title: "Inspection et validation de la parcelle", desc: "Validation de la parcelle avant le démarrage des opérations." },
      { icon: Sprout, title: "Piquetage, trouaison, fourniture des plants et mise en terre", desc: "Mise en place de la plantation selon les caractéristiques de la parcelle et la formule retenue." },
    ],
    variants: [
      {
        name: "PalmTerroir Essentielle",
        desc: "Une formule structurée autour d’un apport initial et d’un règlement échelonné des étapes prévues.",
        points: [
          "Mise en place progressive de la plantation",
          "Encadrement technique pendant le cycle de création",
          "Suivi de l'évolution de la plantation",
          "Accès au portail client digital",
        ],
      },
      {
        name: "PalmTerroir Flexible",
        desc: "Une formule pensée pour organiser le règlement des prestations selon un échéancier défini.",
        points: [
          "Mise en place progressive de la plantation",
          "Paiement organisé progressivement",
          "Encadrement technique pendant le cycle de création",
          "Suivi de l'évolution de la plantation",
        ],
      },
    ],
  },
  terrapalm: {
    name: "TerraPalm",
    eyebrow: "Pour les propriétaires fonciers",
    title: "Vous disposez d’une terre. AgriCapital la valorise par la création d’une plantation de palmier à huile pour vous.",
    intro:
      "AgriCapital valorise votre terre par la création d’une plantation de palmier à huile, avec une mise en place structurée et un accompagnement adapté à la formule retenue.",
    image: terraPalmHero,
    alt: "Plantation TerraPalm en production visitée par l'équipe AgriCapital et des propriétaires fonciers",
    highlights: [
      { icon: Leaf, title: "Valorisation du foncier", desc: "AgriCapital intervient pour créer et développer la plantation sur le foncier mis à disposition." },
      { icon: MapPinned, title: "Foncier sécurisé", desc: "Une parcelle préparée et sécurisée pour la création de la plantation." },
      { icon: Sprout, title: "Création de plantation", desc: "Plants sélectionnés, préparation du terrain, plantation, intrants et suivi technique." },
      { icon: Users, title: "Développement et valorisation", desc: "AgriCapital suit le développement de la plantation et facilite la valorisation de la production selon les conditions convenues." },
    ],
    variants: [
      {
        name: "TerraPalm",
        desc: "Votre plantation vous est remise, vous en assurez la gestion.",
        points: ["Gestion autonome après remise", "Suivi agronomique et fourniture d'intrants", "Portail client digital"],
      },
      {
        name: "TerraPalm+",
        desc: "AgriCapital exploite et gère la plantation à votre place.",
        points: ["Gestion entièrement déléguée", "Entretien, récolte et commercialisation pris en charge", "Rapports et informations de suivi"],
      },
    ],
  },
} as const;

const STEPS = [
  "Identification et validation de la situation",
  "Foncier sécurisé et préparation de la parcelle",
  "Choix de l’offre, contractualisation et lancement des opérations",
  "Développement et suivi de la plantation",
  "Remise de la plantation et accompagnement dans la durée",
];

const PALMTERROIR_STEPS = [
  "Inspection et validation de la parcelle",
  "Piquetage et trouaison",
  "Transport des plants et mise en terre",
  "Suivi et encadrement technique",
  "Accompagnement de la plantation dans la durée",
];

const OffrePage = ({ offer }: { offer: OffreKey }) => {
  const data = OFFERS[offer];
  const other = offer === "palminvest" ? OFFERS.terrapalm : offer === "terrapalm" ? OFFERS.palmterroir : OFFERS.palminvest;
  const otherPath = offer === "palminvest" ? "/terrapalm" : offer === "terrapalm" ? "/palmterroir" : "/palminvest";
  const steps = offer === "palmterroir" ? PALMTERROIR_STEPS : STEPS;

  return (
    <div className="public-page min-h-screen">
      <SEOHead
        title={`${data.name} — Plantation de palmier à huile | AgriCapital`}
        description={data.intro.slice(0, 155)}
      />
      <DynamicNavigation />

      <header className="relative overflow-hidden bg-primary text-primary-foreground pt-[72px]">
        <div className="site-container grid gap-8 xl:gap-14 px-0 py-10 sm:py-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-16">
          <div>
            <p className="mb-4 inline-block rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
              {data.eyebrow}
            </p>
            <h1 className="mb-5 max-w-[18ch] text-3xl font-black tracking-[-.025em] sm:text-4xl lg:text-[clamp(2.35rem,3.35vw,3.75rem)]" style={{ lineHeight: 1.16, overflowWrap: "normal", wordBreak: "normal" }}>{data.title}</h1>
            <p className="max-w-2xl text-base leading-[1.7] text-primary-foreground/85 sm:text-lg xl:text-xl">{data.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ContactCTA>
                <Button size="lg" variant="secondary">{contactCtaLabel()}</Button>
              </ContactCTA>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to={otherPath}>Découvrir {other.name}</Link>
              </Button>
            </div>
          </div>
          <img
            src={data.image}
            alt={data.alt}
            width={1600}
            height={1008}
            className="w-full aspect-[16/10] rounded-2xl object-contain object-center bg-white/5 shadow-strong lg:min-h-[500px]"
          />
        </div>
      </header>

      <section className="py-8 lg:py-10">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Ce que comprend l’offre</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.highlights.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="h-full border-border/60">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-bold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {offer === "palmterroir" && (
            <div className="mt-8 rounded-2xl border border-border/60 bg-muted/30 p-6 md:p-8">
              <h3 className="text-xl font-bold text-foreground">Votre engagement</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                L’offre PalmTerroir s’adresse aux clients qui disposent déjà d’une parcelle. L'entretien courant de la plantation reste à leur charge, notamment le défrichage, le désherbage, la fertilisation et les opérations d'entretien prévues.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Les intrants nécessaires peuvent être fournis par AgriCapital selon les besoins de la plantation et les modalités communiquées dans le cadre de l'accompagnement.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted/40 py-8 lg:py-10">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Deux formules, un même objectif</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {data.variants.map((v) => (
              <Card key={v.name} className="h-full border-primary/20">
                <CardContent className="p-7">
                  <h3 className="text-xl font-black text-primary">{v.name}</h3>
                  <p className="mb-5 mt-2 text-sm text-muted-foreground">{v.desc}</p>
                  <ul className="space-y-3">
                    {v.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Les modalités financières dépendent de la formule retenue et sont présentées lors de l’échange avec AgriCapital.
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Comment ça se passe</h2>
          <ol className="grid gap-4 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s} className="rounded-xl border border-border/60 bg-card p-5">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-primary py-10 text-primary-foreground lg:py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mx-auto mb-4 max-w-3xl text-2xl font-black sm:text-4xl">
            Créer et développer une plantation, selon votre situation.
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/85">
            Un conseiller AgriCapital vous présente l’offre correspondant à votre situation, avec ou sans foncier, ainsi que les principales étapes de mise en œuvre.
          </p>
          <ContactCTA>
            <Button size="lg" variant="secondary">
              {contactCtaLabel()} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </ContactCTA>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OffrePage;
