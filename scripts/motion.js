(() => {
  console.log("motion loaded");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = window.matchMedia("(min-width: 901px)").matches;
  const selectorGroups = {
    hero: ".hero",
    heroVisual: ".hero-art",
    heroContent: ".hero-content",
    heroItems: ".hero .eyebrow, .hero h1, .hero p, .hero .btn",
    productCards: ".product-card",
    featuredCards: ".featured-card",
    promoCards: ".promo-inner, .promo-images img, .promo-copy > *",
    storyCards: ".story",
    ctaButtons: ".btn, .cart",
    sectionTitles: ".section-title",
    footerItems: ".footer-grid > *"
  };
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
    ".stories .story",
    ".newsletter",
    ".footer-grid > *"
  ];
  const desktopSelectors = [
    ".promo-images img",
    ".promo-copy > *"
  ];

  const query = (selector) => Array.from(document.querySelectorAll(selector));

  const logSelectorCounts = () => {
    Object.entries(selectorGroups).forEach(([name, selector]) => {
      const elements = query(selector);
      console.log(`${name}:`, elements.length, selector);
    });

    selectors.concat(isDesktop ? desktopSelectors : []).forEach((selector) => {
      console.log(`reveal selector "${selector}":`, query(selector).length);
    });
  };

  const forceDesktopHeroTest = () => {
    if (!isDesktop || reduceMotion) return;

    const heroVisual = document.querySelector(".hero-art");
    const heroContent = document.querySelector(".hero-content");

    console.log("force desktop hero visual:", heroVisual ? 1 : 0);
    console.log("force desktop hero content:", heroContent ? 1 : 0);

    window.requestAnimationFrame(() => {
      if (heroVisual) heroVisual.classList.add("desktop-force-test");
      if (heroContent) heroContent.classList.add("desktop-load-motion");
    });
  };

  const markRevealItems = () => {
    const activeSelectors = isDesktop ? selectors.concat(desktopSelectors) : selectors;
    const elements = activeSelectors.flatMap((selector) => query(selector));
    const sectionCounts = new Map();

    elements.forEach((element) => {
      element.classList.add("reveal");

      if (element.matches(".product-card, .story, .footer-grid > *, .promo-images img, .promo-copy > *")) {
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
    logSelectorCounts();
    forceDesktopHeroTest();

    const elements = markRevealItems();
    console.log("total reveal elements:", elements.length);
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

    window.requestAnimationFrame(() => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      });
    });

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
