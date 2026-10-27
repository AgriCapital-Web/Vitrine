import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicPageHeroProps {
  title: string;
  description?: string;
  image: string;
  imageAlt: string;
  eyebrow?: string;
}

const PublicPageHero = ({ title, description, image, imageAlt, eyebrow = "AgriCapital" }: PublicPageHeroProps) => {
  const [paused, setPaused] = useState(false);
  return (
    <section className={`institutional-hero ${paused ? "film-paused" : ""}`}>
      <img className="institutional-hero-image" src={image} alt={imageAlt} fetchPriority="high" />
      <div className="institutional-hero-shade" />
      <div className="site-container institutional-hero-content">
        <p className="institutional-hero-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="institutional-hero-description">{description}</p>}
        <Button variant="ghost" size="icon" className="article-glass-icon mt-6" onClick={() => setPaused(!paused)} aria-label={paused ? "Reprendre l’animation" : "Mettre l’animation en pause"} title={paused ? "Reprendre l’animation" : "Mettre l’animation en pause"}>
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
      </div>
    </section>
  );
};

export default PublicPageHero;