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
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { totalVisitors } = useVisitorCount();
  const navigate = useNavigate();
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md ${scrolled ? "shadow-soft" : ""}`}>
      <div className="site-container flex h-[72px] items-center justify-between gap-2 lg:gap-4">
        <Button variant="ghost" onClick={() => go("hero")} className="h-auto shrink-0 p-0 hover:bg-transparent" aria-label="AgriCapital — Accueil">
          <img src={logo} alt="AgriCapital" className="h-auto w-[104px] sm:w-[145px]" />
        </Button>
        <nav className="hidden xl:flex items-center" aria-label="Navigation principale">
          {menuConfig.map((item) => {
            const itemLabel = label(item.label);
            const isOpen = openDesktop === itemLabel;
            return <div key={itemLabel} className="relative" onMouseEnter={() => item.children && setOpenDesktop(itemLabel)} onMouseLeave={() => item.children && setOpenDesktop(null)}>
              <Button variant="ghost" onClick={() => item.children ? setOpenDesktop(isOpen ? null : itemLabel) : go(item.action || "hero", item.isRoute)} className="site-nav-link px-3" aria-expanded={item.children ? isOpen : undefined}>
                {itemLabel}{item.children && <ChevronDown className={`h-3.5 w-3.5 ${isOpen ? "rotate-180" : ""}`} />}
              </Button>
              {item.children && isOpen && <div className="absolute left-0 top-full pt-2"><div className="w-64 rounded-lg border border-border bg-popover p-2 shadow-medium">
                {item.children.map((child) => <Button variant="ghost" key={label(child.label)} onClick={() => go(child.action, child.isRoute)} className="h-auto w-full justify-start px-3 py-3 text-left">{label(child.label)}</Button>)}
              </div></div>}
            </div>;
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-muted-foreground" aria-label={`${totalVisitors.toLocaleString("fr-FR")} visites`} title="Total des visites enregistrées">
            <Eye className="h-3 w-3 text-primary" /><span>{totalVisitors.toLocaleString("fr-FR")}</span><span className="hidden lg:inline">visites</span>
          </div>
          <Button asChild variant="outline" size="icon" className="hidden lg:inline-flex" title="Téléphone"><a href={PHONE_URL} aria-label="Téléphone"><Phone /></a></Button>
          <Button asChild className="h-9 w-9 p-0 sm:h-10 sm:w-auto sm:px-3 bg-accent text-accent-foreground hover:bg-accent/90" title="Espace client">
            <a href={CLIENT_PORTAL_URL} target="_blank" rel="noopener noreferrer" aria-label="Espace client"><UserCircle2 /><span className="hidden sm:inline">{language === "en" ? "Client portal" : "Espace client"}</span></a>
          </Button>
          <div className="relative" ref={languageRef}>
            <Button variant="ghost" onClick={() => setLanguageOpen(!languageOpen)} className="h-9 gap-1 px-1.5 sm:px-3 text-xs uppercase" aria-label="Changer de langue" aria-expanded={languageOpen} title="Changer de langue"><Globe className="hidden sm:block" />{language}<ChevronDown className="h-3 w-3" /></Button>
            {languageOpen && <div className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-border bg-popover p-2 shadow-medium">
              {languages.map((lang) => <Button variant="ghost" key={lang} onClick={() => { setLanguage(lang); setLanguageOpen(false); }} className={`h-auto w-full justify-start px-3 py-2.5 text-left ${language === lang ? "bg-primary/10 text-primary" : ""}`}><span className="text-xs uppercase">{lang}</span>{languageNames[lang]}</Button>)}
            </div>}
          </div>
          <Button variant="ghost" size="icon" className="xl:hidden h-9 w-9 text-primary" onClick={() => { setMobileOpen(!mobileOpen); setLanguageOpen(false); }} aria-label="Menu" aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</Button>
        </div>
      </div>
      {mobileOpen && <nav className="xl:hidden max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-border bg-card shadow-medium" aria-label="Navigation mobile">
        <div className="site-container py-3">
          {menuConfig.map((item) => {
            const itemLabel = label(item.label);
            return <div key={itemLabel} className="border-b border-border last:border-0">
              <Button variant="ghost" onClick={() => item.children ? setOpenMobile(openMobile === itemLabel ? null : itemLabel) : go(item.action || "hero", item.isRoute)} className="h-auto w-full justify-between px-0 py-4 font-bold" aria-expanded={item.children ? openMobile === itemLabel : undefined}>{itemLabel}{item.children && <ChevronDown className={openMobile === itemLabel ? "rotate-180" : ""} />}</Button>
              {item.children && openMobile === itemLabel && <div className="mb-3 border-l-2 border-primary/20 pl-3">{item.children.map((child) => <Button variant="ghost" key={label(child.label)} onClick={() => go(child.action, child.isRoute)} className="h-auto w-full justify-start py-3 text-left text-muted-foreground">{label(child.label)}</Button>)}</div>}
            </div>;
          })}
        </div>
      </nav>}
    </header>
  );
};

export default DynamicNavigation;
