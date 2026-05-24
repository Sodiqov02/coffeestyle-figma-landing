(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = window.matchMedia("(min-width: 901px)").matches;
  console.log("motion.js loaded");
  console.log("desktop:", isDesktop);

  const selectors = [
    ".hero-art",
    ".hero .eyebrow",
    ".hero h1",
    ".hero p",
    ".hero .btn",
    ".intro",
    ".featured .section-title",
    ".featured .product-card",
    ".products .section-title",
    ".products .product-card",
    ".promo .section-title",
    ".promo-inner",
    ".parallax-image",
    ".stories .section-title",
    ".story",
    ".newsletter",
    ".footer-grid > *"
  ];

  const desktopSelectors = [
    ".promo-images img",
    ".promo-copy > *"
  ];

  const query = (selector) => Array.from(document.querySelectorAll(selector));

  const markRevealItems = () => {
    const activeSelectors = isDesktop ? selectors.concat(desktopSelectors) : selectors;
    const elements = [...new Set(activeSelectors.flatMap((selector) => query(selector)))];
    const sectionCounts = new Map();
    const heroItems = query(".hero-art, .hero .eyebrow, .hero h1, .hero p, .hero .btn");

    elements.forEach((element) => {
      element.classList.add("reveal");

      if (element.matches(".hero-art")) {
        element.style.setProperty("--reveal-x", "-50%");
        element.style.setProperty("--reveal-y", "30px");
        element.style.setProperty("--reveal-scale", "1.015");
      }

      if (heroItems.includes(element)) {
        const index = heroItems.indexOf(element);
        element.style.setProperty("--reveal-delay", `${180 + index * 90}ms`);
      } else if (element.matches(".product-card, .story, .footer-grid > *, .promo-images img, .promo-copy > *")) {
        const parent = element.parentElement;
        const index = sectionCounts.get(parent) || 0;
        sectionCounts.set(parent, index + 1);
        element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 420)}ms`);
      }
    });

    return elements;
  };

  const revealAll = (elements) => {
    elements.forEach((element) => element.classList.add("is-visible"));
  };

  const revealAboveFold = (elements, observer) => {
    elements.forEach((element) => {
      if (element.classList.contains("is-visible")) return;
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) {
        element.classList.add("is-visible");
        if (observer) observer.unobserve(element);
      }
    });
  };

  const init = () => {
    const revealTargets = markRevealItems();
    console.log("reveal targets:", revealTargets.length);
    document.body.classList.add("motion-ready");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealAll(revealTargets);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12
      }
    );

    revealTargets.forEach((element) => observer.observe(element));

    let ticking = false;
    const revealPassedItems = () => {
      revealAboveFold(revealTargets, observer);
      ticking = false;
    };

    const queueRevealCheck = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(revealPassedItems);
    };

    window.addEventListener("scroll", queueRevealCheck, { passive: true });
    window.addEventListener("resize", queueRevealCheck);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(queueRevealCheck);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
