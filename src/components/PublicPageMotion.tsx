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
      mutations.disconnect();
      reducedMotion.removeEventListener("change", onMotionChange);
      observed.forEach((element) => element.classList.remove("institutional-reveal", "institutional-visible"));
      document.body.classList.remove("institutional-public");
    };
  }, [pathname]);

  return null;
};

export default PublicPageMotion;