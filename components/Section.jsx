"use client";

export default function Section({ id, first = false, last = false, children }) {
  const scrollTo = (target) => {
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  const scrollNext = () => {
    const next = document.getElementById(id)?.nextElementSibling;
    scrollTo(next);
  };

  const scrollPrev = () => {
    const prev = document.getElementById(id)?.previousElementSibling;
    scrollTo(prev);
  };

  return (
    <section id={id} className="section">
      <div className="section__inner">{children}</div>
      {!first && (
        <button
          type="button"
          className="cue cue--up"
          onClick={scrollPrev}
          aria-label="Scroll to previous section"
        >
          <span className="cue__label" aria-hidden="true">
            scroll
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
      {!last && (
        <button
          type="button"
          className="cue cue--down"
          onClick={scrollNext}
          aria-label="Scroll to next section"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          <span className="cue__label" aria-hidden="true">
            scroll
          </span>
        </button>
      )}
    </section>
  );
}
