import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Progressive enhancement: all content stays readable without motion or JavaScript. */
const PublicPageMotion = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    document.body.classList.add("institutional-public");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observed = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("institutional-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06 });
    const counted = new Set<Element>();
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);
        const el = entry.target as HTMLElement;
        const original = el.textContent || "";
        const m = original.match(/\d[\d\s.]*/);
        if (!m) return;
        const target = parseInt(m[0].replace(/[\s.]/g, ""), 10);
        if (!target || target > 1000000) return;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 1400);
          const v = Math.round(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) { el.textContent = original.replace(m[0].trim(), String(v)); requestAnimationFrame(step); }
          else el.textContent = original;
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    // Micro-parallax on section photos.
    const onScroll = () => {
      if (reducedMotion.matches) return;
      document.querySelectorAll<HTMLElement>("main section img.object-cover, .institutional-hero img").forEach((img) => {
        if (img.closest(".grid .rounded-full, .news-article-page")) return;
        const r = img.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const offset = ((r.top + r.height / 2) / window.innerHeight - 0.5) * -14;
        img.style.translate = `0 ${offset.toFixed(1)}px`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const discover = () => {
      if (reducedMotion.matches) return;
      document.querySelectorAll("main section, main article > header, #apropos > div > div, #approche .belife-card, #equipe .grid > *, #impact .grid > *, .public-page > section").forEach((element) => {
        if (observed.has(element) || element.closest(".news-article-page") || element.querySelector(".article-cinematic-hero")) return;
        observed.add(element);
        element.classList.add("institutional-reveal");
        observer.observe(element);
      });
      document.querySelectorAll<HTMLVideoElement>("main video[autoplay]").forEach((video) => {
        video.controls = true;
      });
      // Staggered cards: each grid child arrives 100ms after the previous one.
      document.querySelectorAll("main .grid").forEach((grid) => {
        if (grid.closest(".news-article-page")) return;
        Array.from(grid.children).forEach((child, i) => {
          const el = child as HTMLElement;
          if (observed.has(el)) return;
          observed.add(el);
          el.classList.add("institutional-reveal", "institutional-card");
          el.style.transitionDelay = `${Math.min(i, 6) * 100}ms`;
          observer.observe(el);
        });
      });
      // Animated counters: digits count up, then the exact original text is restored.
      const walker = document.createTreeWalker(document.querySelector("main") || document.body, NodeFilter.SHOW_TEXT);
      const numeric = /^([+]?\s?)(\d{1,3}(?:[\s.]\d{3})*|\d+)(\s?[+%]?\s?\w{0,6})$/;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent?.trim() || "";
        const parent = n.parentElement;
        if (!parent || counted.has(parent) || !numeric.test(text) || parent.closest("nav, footer, form, button, .news-article-page")) continue;
        const size = parseFloat(getComputedStyle(parent).fontSize);
        if (size < 24) continue;
        counted.add(parent);
        counterObserver.observe(parent);
      }
    };
    discover();
    const mutations = new MutationObserver(discover);
    mutations.observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
    const onMotionChange = () => {
      if (reducedMotion.matches) {
        observed.forEach((element) => element.classList.add("institutional-visible"));
        document.querySelectorAll<HTMLVideoElement>("main video[autoplay]").forEach((video) => video.pause());
      } else discover();
    };
    onMotionChange();
    reducedMotion.addEventListener("change", onMotionChange);
    return () => {
      observer.disconnect();
      counterObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      mutations.disconnect();
      reducedMotion.removeEventListener("change", onMotionChange);
      observed.forEach((element) => element.classList.remove("institutional-reveal", "institutional-visible"));
      document.body.classList.remove("institutional-public");
    };
  }, [pathname]);

  return null;
};

export default PublicPageMotion;