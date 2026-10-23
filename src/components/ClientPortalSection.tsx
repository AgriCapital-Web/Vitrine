import { ArrowRight, CreditCard, FileText, Images, MessageCircle, ShieldCheck, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";

const CLIENT_PORTAL_URL = "https://client.agricapital.ci";

const portalFeatures = [
  { icon: CreditCard, label: "Paiements mensuels" },
  { icon: Sprout, label: "Suivi plantation" },
  { icon: FileText, label: "Documents & rapports" },
  { icon: Images, label: "Photos & vidéos terrain" },
  { icon: MessageCircle, label: "Échanges avec l'équipe" },
];

const ClientPortalSection = () => (
  <section id="espace-client" className="bg-secondary/50 py-12 sm:py-14 lg:py-16">
    <div className="container mx-auto px-4">
      <div>
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="py-4 pr-0 lg:pr-10">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="mb-3 text-xs font-bold uppercase text-primary">Portail sécurisé</p>
            <h2 className="text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">Espace Client Digital AgriCapital</h2>
          </div>

          <div className="py-4 lg:border-l lg:border-border lg:pl-10">
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Un portail sécurisé vous permettant d'effectuer vos paiements mensuels, de suivre l'évolution de votre plantation, d'accéder à vos documents, rapports, photos et vidéos de terrain, et d'échanger avec nos équipes tout au long du cycle de production.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {portalFeatures.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 py-2.5 text-sm font-semibold text-foreground">
                  <Icon className="h-4 w-4 shrink-0 text-accent" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <Button asChild size="lg" className="mt-7 bg-accent text-accent-foreground hover:bg-accent/90"><a
              href={CLIENT_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Accéder à mon Espace Client
              <ArrowRight className="h-4 w-4" />
            </a></Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ClientPortalSection;