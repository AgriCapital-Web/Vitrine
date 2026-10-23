import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DataroomTeaser = () => (
  <section className="py-10 md:py-14 bg-gradient-to-br from-primary/5 to-accent/5">
    <div className="container mx-auto px-4 md:px-6">
      <div className="border-y border-primary/20 py-6 md:py-8 flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
            AgriCapital Cloud — Espace Documentaire Confidentiel
          </h3>
          <p className="text-sm text-muted-foreground">
            Accédez à nos documents stratégiques, présentations et données de manière sécurisée. Signature NDA numérique requise.
          </p>
        </div>
        <Button asChild><Link
          to="/dataroom"
        >
          Accéder au portail <ArrowRight className="w-4 h-4" />
        </Link></Button>
      </div>
    </div>
  </section>
);

export default DataroomTeaser;
