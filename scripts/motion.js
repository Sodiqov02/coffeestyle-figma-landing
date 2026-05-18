(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const selectors = [
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

  const markRevealItems = () => {
    const elements = selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
    const sectionCounts = new Map();

    elements.forEach((element) => {
      element.classList.add("reveal");

      if (element.matches(".product-card, .story, .footer-grid > *")) {
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

  const init = () => {
    const elements = markRevealItems();
    document.body.classList.add("motion-ready");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealAll(elements);
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

    elements.forEach((element) => observer.observe(element));

    let ticking = false;
    const revealPassedItems = () => {
      elements.forEach((element) => {
        if (element.classList.contains("is-visible")) return;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.88) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      });
      ticking = false;
    };

    const queueRevealCheck = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(revealPassedItems);
    };

    window.addEventListener("scroll", queueRevealCheck, { passive: true });
    window.addEventListener("resize", queueRevealCheck);
    queueRevealCheck();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
