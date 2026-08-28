"use client";

export default function Section({ id, last = false, children }) {
  const scrollNext = () => {
    const next = document.getElementById(id)?.nextElementSibling;
    if (next) next.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id={id} className="section">
      <div className="section__inner">{children}</div>
      {!last && (
        <button
          type="button"
          className="cue"
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
        </button>
      )}
    </section>
  );
}
