import { useEffect, useState } from "react";
import { REPORT_SECTIONS } from "./reportSections";

export default function ReportSectionNav({ scrollRootRef }) {
  const [activeSection, setActiveSection] = useState(REPORT_SECTIONS[0].id);

  useEffect(() => {
    const elements = REPORT_SECTIONS.map(({ id }) => document.getElementById(id)).filter(Boolean);
    if (elements.length === 0) return undefined;

    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
          if (visible[0]) setActiveSection(visible[0].target.id);
        },
        {
          root: scrollRootRef?.current || null,
          rootMargin: "-12% 0px -72% 0px",
          threshold: 0,
        }
      );

      elements.forEach((element) => observer.observe(element));
      return () => observer.disconnect();
    }

    const root = scrollRootRef?.current;
    if (!root) return undefined;

    function updateActiveSection() {
      const rootTop = root.getBoundingClientRect().top;
      const current = elements
        .filter((element) => element.getBoundingClientRect().top <= rootTop + 100)
        .at(-1);
      if (current) setActiveSection(current.id);
    }

    root.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();
    return () => root.removeEventListener("scroll", updateActiveSection);
  }, [scrollRootRef]);

  function navigateTo(id) {
    const target = document.getElementById(id);
    if (!target) return;

    setActiveSection(id);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <>
      <nav
        aria-label="Report sections"
        className="sticky top-0 z-20 -mx-4 mb-5 overflow-x-auto border-b border-stone/35 bg-charcoal/95 px-4 py-2 backdrop-blur-xl lg:hidden"
      >
        <ul className="flex w-max min-w-full gap-1">
          {REPORT_SECTIONS.map((section) => {
            const active = activeSection === section.id;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => navigateTo(section.id)}
                  aria-current={active ? "location" : undefined}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? "bg-slate-ash text-ivory ring-1 ring-bronze/35"
                      : "text-parchment hover:bg-slate-ash/60 hover:text-ivory"
                  }`}
                >
                  {section.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav
        aria-label="Report sections"
        className="sticky top-0 hidden max-h-[calc(88dvh-5rem)] self-start overflow-y-auto pr-2 lg:block"
      >
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faded">
          In this report
        </p>
        <ul className="space-y-1">
          {REPORT_SECTIONS.map((section) => {
            const active = activeSection === section.id;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => navigateTo(section.id)}
                  aria-current={active ? "location" : undefined}
                  className={`relative w-full rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-[background-color,color,transform] duration-150 ${
                    active
                      ? "bg-bronze/[0.1] text-ivory ring-1 ring-bronze/30"
                      : "text-parchment hover:translate-x-0.5 hover:bg-slate-ash/55 hover:text-ivory"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-2 left-1.5 top-2 w-0.5 rounded-full bg-bronze"
                    />
                  )}
                  <span className="block pl-1">{section.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
