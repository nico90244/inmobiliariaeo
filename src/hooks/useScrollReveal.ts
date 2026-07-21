import { useEffect } from "react";

/**
 * Observes all .reveal elements on the page.
 * Adds "in-view" class when each element enters the viewport,
 * triggering the CSS transition defined in index.css.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px 0px 0px" }
    );

    const observe = () => {
      document.querySelectorAll<Element>(".reveal").forEach((el) => {
        if (!el.classList.contains("in-view")) observer.observe(el);
      });
    };

    // Observe immediately and after a short delay for async-rendered content
    observe();
    const t = setTimeout(observe, 350);

    return () => {
      observer.disconnect();
      clearTimeout(t);
    };
  }, []);
}
