import { useEffect, useRef, useState } from "react";
import { ChevronDown, Eye, Globe, Menu, Phone, UserCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage, Language, languageNames } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useVisitorCount } from "@/hooks/useVisitorCount";

const logo = "/logo-agricapital.png";
const CLIENT_PORTAL_URL = "https://client.agricapital.ci";
const PHONE_URL = "tel:+2250564551717";
const languages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

interface SubMenuItem { label: Record<Language, string>; action: string; isRoute?: boolean; }
interface MenuItem { label: Record<Language, string>; action?: string; isRoute?: boolean; children?: SubMenuItem[]; }

const menuConfig: MenuItem[] = [
  { label: { fr: "Accueil", en: "Home", ar: "الرئيسية", es: "Inicio", de: "Startseite", zh: "首页" }, action: "hero" },
  {
    label: { fr: "AgriCapital", en: "AgriCapital", ar: "AgriCapital", es: "AgriCapital", de: "AgriCapital", zh: "AgriCapital" },
    children: [
      { label: { fr: "À propos", en: "About", ar: "من نحن", es: "Nosotros", de: "Über uns", zh: "关于" }, action: "/a-propos", isRoute: true },
      { label: { fr: "Notre capacité", en: "Our capacity", ar: "قدرتنا", es: "Capacidad", de: "Kapazität", zh: "能力" }, action: "/impact", isRoute: true },
      { label: { fr: "Évolution", en: "Evolution", ar: "التطور", es: "Evolución", de: "Entwicklung", zh: "发展" }, action: "/evolution", isRoute: true },
      { label: { fr: "Équipe", en: "Team", ar: "الفريق", es: "Equipo", de: "Team", zh: "团队" }, action: "/equipe", isRoute: true },
    ],
  },
  {
    label: { fr: "Solutions", en: "Solutions", ar: "الحلول", es: "Soluciones", de: "Lösungen", zh: "解决方案" },
    children: [
      { label: { fr: "Toutes nos solutions", en: "All solutions", ar: "كل الحلول", es: "Todas las soluciones", de: "Alle Lösungen", zh: "全部方案" }, action: "/solutions", isRoute: true },
      { label: { fr: "PalmInvest", en: "PalmInvest", ar: "PalmInvest", es: "PalmInvest", de: "PalmInvest", zh: "PalmInvest" }, action: "/palminvest", isRoute: true },
      { label: { fr: "TerraPalm", en: "TerraPalm", ar: "TerraPalm", es: "TerraPalm", de: "TerraPalm", zh: "TerraPalm" }, action: "/terrapalm", isRoute: true },
      { label: { fr: "PalmTerroir", en: "PalmTerroir", ar: "PalmTerroir", es: "PalmTerroir", de: "PalmTerroir", zh: "PalmTerroir" }, action: "/palmterroir", isRoute: true },
    ],
  },
  {
    label: { fr: "Ressources", en: "Resources", ar: "الموارد", es: "Recursos", de: "Ressourcen", zh: "资源" },
    children: [
      { label: { fr: "Actualités", en: "News", ar: "الأخبار", es: "Noticias", de: "Nachrichten", zh: "新闻" }, action: "/new", isRoute: true },
      { label: { fr: "Témoignages", en: "Testimonials", ar: "الشهادات", es: "Testimonios", de: "Referenzen", zh: "推荐" }, action: "/temoignages", isRoute: true },
      { label: { fr: "FAQ", en: "FAQ", ar: "الأسئلة", es: "FAQ", de: "FAQ", zh: "常见问题" }, action: "/faq", isRoute: true },
      { label: { fr: "Le trésor caché du foncier", en: "The hidden treasure of land", ar: "الكنز الخفي للأرض", es: "El tesoro oculto de la tierra", de: "Der verborgene Schatz des Bodens", zh: "土地的隐藏宝藏" }, action: "/tresor-foncier", isRoute: true },
      { label: { fr: "Le trésor caché du palmier", en: "The hidden treasure of oil palm", ar: "الكنز الخفي لنخيل الزيت", es: "El tesoro oculto de la palma aceitera", de: "Der verborgene Schatz der Ölpalme", zh: "油棕的隐藏宝藏" }, action: "/tresor-palmier", isRoute: true },
    ],
  },
  { label: { fr: "Contact", en: "Contact", ar: "اتصل بنا", es: "Contacto", de: "Kontakt", zh: "联系" }, action: "/contact", isRoute: true },
];

const DynamicNavigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktop, setOpenDesktop] = useState<string | null>(null);
  const [openMobile, setOpenMobile] = useState<string | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { totalVisitors } = useVisitorCount();
  const navigate = useNavigate();
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) setLanguageOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const label = (labels: Record<Language, string>) => labels[language] || labels.fr;
  const go = (action: string, isRoute?: boolean) => {
    setMobileOpen(false); setOpenDesktop(null); setOpenMobile(null);
    if (isRoute) { navigate(action); return; }
    const target = document.getElementById(action);
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 84, behavior: "smooth" });
    else navigate(`/#${action}`);
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 shadow-[0_8px_30px_rgba(16,45,34,.08)] backdrop-blur-xl" : "bg-white/90 backdrop-blur-md"}`}>
      <div className="border-b border-border/60">
        <div className="site-container flex h-[72px] items-center justify-between gap-5 px-0">
          <button onClick={() => go("hero")} className="shrink-0" aria-label="AgriCapital — Accueil">
            <img src={logo} alt="AgriCapital" className="h-12 w-auto sm:h-14 lg:h-14" />
          </button>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
            {menuConfig.map((item) => {
              const itemLabel = label(item.label);
              const isOpen = openDesktop === itemLabel;
              return (
                <div key={itemLabel} className="relative" onMouseEnter={() => item.children && setOpenDesktop(itemLabel)} onMouseLeave={() => item.children && setOpenDesktop(null)}>
                  <button onClick={() => item.children ? setOpenDesktop(isOpen ? null : itemLabel) : go(item.action!, item.isRoute)} className="site-nav-link text-[15px] xl:text-base" aria-expanded={item.children ? isOpen : undefined}>
                    {itemLabel}{item.children && <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />}
                  </button>
                  {item.children && isOpen && (
                    <div className="absolute left-0 top-full pt-3">
                      <div className="w-64 overflow-hidden rounded-2xl border border-border/70 bg-white p-2 shadow-[0_20px_50px_rgba(16,45,34,.14)]">
                        {item.children.map((child) => (
                          <button key={label(child.label)} onClick={() => go(child.action, child.isRoute)} className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/75 transition-colors hover:bg-primary/5 hover:text-primary">
                            {label(child.label)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-border/70 bg-white px-3 py-2 text-xs font-semibold text-muted-foreground" title="Total des visites enregistrées">
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span>{totalVisitors.toLocaleString("fr-FR")}</span>
              <span>visites</span>
            </div>
            <a href={PHONE_URL} className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-primary transition-colors hover:border-primary/30 hover:bg-primary/5" aria-label="Téléphone">
              <Phone className="h-4 w-4" />
            </a>
            <a href={CLIENT_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-all hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-lg">
              <UserCircle2 className="h-4 w-4" /><span>{language === "en" ? "Client portal" : "Espace clients"}</span>
            </a>
            <div className="relative hidden sm:block" ref={languageRef}>
              <button onClick={() => setLanguageOpen(!languageOpen)} className="flex h-10 items-center gap-1.5 rounded-full border border-border/70 px-3 text-xs font-bold uppercase text-foreground/70 hover:bg-muted" aria-label="Changer de langue">
                <Globe className="h-4 w-4" />{language}
              </button>
              {languageOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-border bg-white p-2 shadow-[0_20px_50px_rgba(16,45,34,.14)]">
                  {languages.map((lang) => (
                    <button key={lang} onClick={() => { setLanguage(lang); setLanguageOpen(false); }} className={`w-full rounded-xl px-3 py-2 text-left text-sm ${language === lang ? "bg-primary/5 font-bold text-primary" : "text-foreground/70 hover:bg-muted"}`}>
                      <span className="mr-2 text-[10px] uppercase text-muted-foreground">{lang}</span>{languageNames[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-primary" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden max-h-[calc(100dvh-72px)] overflow-y-auto border-b border-border bg-white shadow-xl">
          <div className="site-container py-4">
            {menuConfig.map((item) => {
              const itemLabel = label(item.label);
              return (
                <div key={itemLabel} className="border-b border-border/60 last:border-0">
                  {item.children ? (
                    <>
                      <button onClick={() => setOpenMobile(openMobile === itemLabel ? null : itemLabel)} className="flex w-full items-center justify-between py-4 text-left text-sm font-bold">
                        {itemLabel}<ChevronDown className={`h-4 w-4 transition-transform ${openMobile === itemLabel ? "rotate-180" : ""}`} />
                      </button>
                      {openMobile === itemLabel && (
                        <div className="mb-3 space-y-1 border-l-2 border-primary/15 pl-3">
                          {item.children.map((child) => (
                            <button key={label(child.label)} onClick={() => go(child.action, child.isRoute)} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-primary">
                              {label(child.label)}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <button onClick={() => go(item.action!, item.isRoute)} className="w-full py-4 text-left text-sm font-bold">{itemLabel}</button>
                  )}
                </div>
              );
            })}
            <div className="mb-4 overflow-hidden rounded-2xl border border-border/70 bg-white">
              <button
                type="button"
                onClick={() => setMobileLanguageOpen((open) => !open)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold"
                aria-expanded={mobileLanguageOpen}
              >
                <span className="inline-flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />{languageNames[language]}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileLanguageOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileLanguageOpen && (
                <div className="grid grid-cols-2 gap-2 border-t border-border/60 bg-muted/20 p-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => { setLanguage(lang); setMobileLanguageOpen(false); setMobileOpen(false); }}
                      className={`rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${language === lang ? "bg-primary/10 font-bold text-primary" : "text-foreground/75 hover:bg-white"}`}
                    >
                      <span className="mr-2 text-[10px] font-bold uppercase text-muted-foreground">{lang}</span>{languageNames[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-xs font-semibold text-primary"><Eye className="h-3.5 w-3.5" /> {totalVisitors.toLocaleString("fr-FR")} visites</div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button asChild variant="outline"><a href={PHONE_URL}>Appeler</a></Button>
              <Button asChild><a href={CLIENT_PORTAL_URL} target="_blank" rel="noopener noreferrer">Espace clients</a></Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default DynamicNavigation;
