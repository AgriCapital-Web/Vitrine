const logoWhite = "/logo-agricapital-footer.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HelpCircle, Linkedin, Facebook, MessageCircle, ArrowUpRight } from "lucide-react";
import Newsletter from "./Newsletter";

const Footer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    const isHome = location.pathname === "/" || location.pathname === "/fr" || location.pathname === "/en";
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/#${id}`);
    }
  };

  const discover = [
    { label: t.nav.about, action: "apropos" },
    { label: t.nav.approach, action: "approche" },
    { label: t.nav.impact, action: "impact" },
    { label: t.nav.partnership, action: "partenariat" },
    { label: t.nav.contact, action: "contact" },
  ];

  return (
    <footer className="bg-agri-green text-primary-foreground">
      <div className="container mx-auto px-4 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <img src={logoWhite} alt="AgriCapital" className="h-12 sm:h-14 w-auto mb-5" loading="lazy" />
            <p className="text-primary-foreground/75 text-sm leading-7 max-w-sm">{t.footer.description}</p>
            <p className="text-primary-foreground/55 text-[11px] font-bold uppercase tracking-[0.16em] mt-5">{t.footer.capitalSocial}</p>
          </div>

          <div>
            <h3 className="belife-footer-heading">{t.footer.quickLinks}</h3>
            <ul className="space-y-2.5 text-sm">
              {discover.map((item) => (
                <li key={item.action}>
                  <button onClick={() => scrollToSection(item.action)} className="text-primary-foreground/75 hover:text-primary-foreground transition-colors text-left">
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/evolution" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                  Évolution <ArrowUpRight size={13} />
                </Link>
              </li>
              <li>
                <Link to="/new" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                  Actualités <ArrowUpRight size={13} />
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                  Solutions & services <ArrowUpRight size={13} />
                </Link>
              </li>
              <li>
                <Link to="/palmterroir" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                  PalmTerroir <ArrowUpRight size={13} />
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                  <HelpCircle size={13} /> FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="belife-footer-heading">{t.contact.title}</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-primary-foreground/50 text-[11px] uppercase tracking-wider mb-1">{t.contact.address.title}</p>
                <p className="text-primary-foreground/85">{t.contact.address.value}</p>
              </div>
              <div>
                <p className="text-primary-foreground/50 text-[11px] uppercase tracking-wider mb-1">{t.contact.email.title}</p>
                <a href="mailto:contact@agricapital.ci" className="text-primary-foreground/85 hover:text-primary-foreground transition-colors break-all">contact@agricapital.ci</a>
              </div>
              <div>
                <p className="text-primary-foreground/50 text-[11px] uppercase tracking-wider mb-1">{t.contact.phone.title}</p>
                <a href="tel:+2250564551717" className="text-primary-foreground/85 hover:text-primary-foreground transition-colors">+225 05 64 55 17 17</a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="belife-footer-heading">{t.newsletter?.title || "Newsletter"}</h3>
            <p className="text-primary-foreground/75 text-sm leading-6 mb-4">{t.newsletter?.subtitle || "Restez informé de nos actualités."}</p>
            <Newsletter />
          </div>
        </div>

        <div className="border-t border-primary-foreground/15 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/55 text-xs text-center md:text-left">© {new Date().getFullYear()} {t.footer.copyright}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="https://www.linkedin.com/company/agricapital-ci" target="_blank" rel="noopener noreferrer" aria-label="AgriCapital sur LinkedIn" className="inline-flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground text-xs bg-primary-foreground/10 hover:bg-primary-foreground/15 px-3 py-1.5 rounded-full transition-colors">
              <Linkedin size={14} /> LinkedIn
            </a>
            <a href="https://www.facebook.com/share/1K9g91ffHn/" target="_blank" rel="noopener noreferrer" aria-label="AgriCapital sur Facebook" className="inline-flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground text-xs bg-primary-foreground/10 hover:bg-primary-foreground/15 px-3 py-1.5 rounded-full transition-colors"><Facebook size={14} /> Facebook</a>
            <a href="https://wa.me/2250564551717" target="_blank" rel="noopener noreferrer" aria-label="AgriCapital sur WhatsApp" className="inline-flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground text-xs bg-primary-foreground/10 hover:bg-primary-foreground/15 px-3 py-1.5 rounded-full transition-colors"><MessageCircle size={14} /> WhatsApp</a>
            <Link to="/partenariat-demande" className="text-primary-foreground/70 hover:text-primary-foreground text-xs transition-colors">Devenir partenaire</Link>
            <p className="text-primary-foreground/45 text-xs italic">Investir la terre. Cultiver l'avenir.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
