import { useEffect, useState } from "react";
import { Sparkles, Sprout, X } from "lucide-react";

/**
 * Temporary first-anniversary celebration.
 * Automatically active from 20 to 31 October 2026 (inclusive), then disappears.
 * No popup, storage, network request, or third-party dependency.
 */
export default function AnniversaryFloat() {
  const [active, setActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const now = new Date();
    const start = new Date(2026, 9, 20, 0, 0, 0, 0);
    const end = new Date(2026, 10, 1, 0, 0, 0, 0);
    setActive(now >= start && now < end);

    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!active || dismissed) return null;

  return (
    <>
      <style>{`
        @keyframes ac-anniversary-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes ac-anniversary-glint {
          0%, 100% { opacity: .35; transform: scale(.85); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        .ac-anniversary-float { animation: ac-anniversary-float 4.5s ease-in-out infinite; }
        .ac-anniversary-glint { animation: ac-anniversary-glint 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ac-anniversary-float, .ac-anniversary-glint { animation: none !important; }
        }
      `}</style>
      <aside
        aria-label="Célébration du premier anniversaire d’AgriCapital"
        className={`fixed z-[60] bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 sm:right-6 transition-all duration-500 ${scrolled ? "translate-y-0 opacity-100" : "translate-y-2 opacity-95"}`}
      >
        {expanded && (
          <div className="mb-3 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-amber-300/70 bg-white p-4 shadow-2xl shadow-emerald-950/20 dark:bg-slate-950">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-amber-300">
                <Sprout size={24} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-600">Une année déjà</p>
                <h2 className="mt-1 text-lg font-extrabold leading-tight text-emerald-900 dark:text-emerald-300">AgriCapital fête ses 1 an !</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">Une année d’engagement pour une agriculture plus forte et un patrimoine agricole durable.</p>
                <p className="mt-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">Ensemble, cultivons l’avenir.</p>
              </div>
              <button type="button" onClick={() => setExpanded(false)} aria-label="Fermer le message anniversaire" className="rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={17} />
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-label={expanded ? "Masquer le message du premier anniversaire" : "Découvrir le message du premier anniversaire d’AgriCapital"}
            className="ac-anniversary-float group flex items-center gap-2 rounded-full border border-amber-300/80 bg-emerald-800 px-3 py-2.5 text-white shadow-lg shadow-emerald-950/25 transition hover:-translate-y-0.5 hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 sm:gap-3 sm:px-4"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 font-black text-emerald-950">
              1<span className="absolute -right-1 -top-1 ac-anniversary-glint text-amber-200"><Sparkles size={13} fill="currentColor" /></span>
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[10px] font-bold uppercase tracking-[.18em] text-amber-200 sm:text-[11px]">AgriCapital</span>
              <span className="block text-sm font-extrabold sm:text-base">1 an déjà !</span>
            </span>
            <Sparkles className="ml-0.5 text-amber-300" size={17} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setDismissed(true)} aria-label="Masquer la célébration anniversaire" className="rounded-full border border-slate-200 bg-white/95 p-1.5 text-slate-500 shadow hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            <X size={14} />
          </button>
        </div>
      </aside>
    </>
  );
}
