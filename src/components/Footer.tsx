const logoWhite = "/logo-agricapital-footer.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HelpCircle, Linkedin, ArrowUpRight } from "lucide-react";
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
    <footer className="bg-agri-green text-white">
      <div className="container mx-auto px-4 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <img src={logoWhite} alt="AgriCapital" className="h-12 sm:h-14 w-auto mb-5" loading="lazy" />
            <p className="text-white/75 text-sm leading-7 max-w-sm">{t.footer.description}</p>
            <p className="text-white/55 text-[11px] font-bold uppercase tracking-[0.16em] mt-5">{t.footer.capitalSocial}</p>
          </div>

          <div>
            <h3 className="belife-footer-heading">{t.footer.quickLinks}</h3>
            <ul className="space-y-2.5 text-sm">
              {discover.map((item) => (
                <li key={item.action}>
                  <button onClick={() => scrollToSection(item.action)} className="text-white/75 hover:text-white transition-colors text-left">
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/evolution" className="text-white/75 hover:text-white transition-colors inline-flex items-center gap-1">
                  Évolution <ArrowUpRight size={13} />
                </Link>
              </li>
              <li>
                <Link to="/new" className="text-white/75 hover:text-white transition-colors inline-flex items-center gap-1">
                  Actualités <ArrowUpRight size={13} />
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-white/75 hover:text-white transition-colors inline-flex items-center gap-1">
                  Solutions & services <ArrowUpRight size={13} />
                </Link>
              </li>
              <li>
                <Link to="/palmterroir" className="text-white/75 hover:text-white transition-colors inline-flex items-center gap-1">
                  PalmTerroir <ArrowUpRight size={13} />
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/75 hover:text-white transition-colors inline-flex items-center gap-1">
                  <HelpCircle size={13} /> FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="belife-footer-heading">{t.contact.title}</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-white/50 text-[11px] uppercase tracking-wider mb-1">{t.contact.address.title}</p>
                <p className="text-white/85">{t.contact.address.value}</p>
              </div>
              <div>
                <p className="text-white/50 text-[11px] uppercase tracking-wider mb-1">{t.contact.email.title}</p>
                <a href="mailto:contact@agricapital.ci" className="text-white/85 hover:text-white transition-colors break-all">contact@agricapital.ci</a>
              </div>
              <div>
                <p className="text-white/50 text-[11px] uppercase tracking-wider mb-1">{t.contact.phone.title}</p>
                <a href="tel:+2250564551717" className="text-white/85 hover:text-white transition-colors">+225 05 64 55 17 17</a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="belife-footer-heading">{t.newsletter?.title || "Newsletter"}</h3>
            <p className="text-white/75 text-sm leading-6 mb-4">{t.newsletter?.subtitle || "Restez informé de nos actualités."}</p>
            <Newsletter />
          </div>
        </div>

        <div className="border-t border-white/15 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/55 text-xs text-center md:text-left">© {new Date().getFullYear()} {t.footer.copyright}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="https://www.linkedin.com/company/agricapital-ci" target="_blank" rel="noopener noreferrer" aria-label="AgriCapital sur LinkedIn" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full transition-colors">
              <Linkedin size={14} /> LinkedIn
            </a>
            <Link to="/partenariat-demande" className="text-white/70 hover:text-white text-xs transition-colors">Devenir partenaire</Link>
            <p className="text-white/45 text-xs italic">Investir la terre. Cultiver l'avenir.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
