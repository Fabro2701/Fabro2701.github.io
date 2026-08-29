"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function ExternalIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function ProjectOverlay({ project, srcs, onClose }) {
  const count = srcs.length;
  const [current, setCurrent] = useState(0);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);

  const next = useCallback(
    () => setCurrent((i) => (i + 1) % count),
    [count]
  );
  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + count) % count),
    [count]
  );

  useEffect(() => {
    openerRef.current = document.activeElement;
    const dialog = dialogRef.current;
    if (dialog) dialog.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };

    const onFocus = (e) => {
      const dialog = dialogRef.current;
      if (dialog && !dialog.contains(e.target)) {
        const focusable = dialog.querySelectorAll(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      if (openerRef.current?.focus) openerRef.current.focus();
    };
  }, [onClose, next, prev]);

  const media = useMemo(
    () => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={srcs[current]} alt={`${project.title} — visual ${current + 1}`} draggable={false} />
    ),
    [srcs, current, project.title]
  );

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="overlay__scrim" onMouseDown={onClose} aria-hidden="true" />
      <div
        className="overlay__card"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="overlay__close"
          onClick={onClose}
          aria-label="Close project"
        >
          ✕
        </button>

        <div className="overlay__media">
          {media}
        </div>

        {count > 1 && (
          <div className="overlay__slicer">
            <button
              type="button"
              className="overlay__nav"
              onClick={prev}
              aria-label="Previous visual"
            >
              ‹
            </button>
            <div className="overlay__thumbs">
              {srcs.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className="overlay__thumb"
                  aria-current={i === current}
                  aria-label={`Visual ${i + 1} of ${count}`}
                  onClick={() => setCurrent(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" draggable={false} />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="overlay__nav"
              onClick={next}
              aria-label="Next visual"
            >
              ›
            </button>
            <span className="overlay__counter mono">{`${current + 1} / ${count}`}</span>
          </div>
        )}

        <div className="overlay__body">
          <div className="overlay__title-row">
            <h3 className="overlay__title">{project.title}</h3>
            {project.url && (
              <a
                className="overlay__link"
                href={project.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.title} — open repository`}
              >
                <ExternalIcon />
              </a>
            )}
          </div>
          <p className="overlay__desc">{project.description}</p>
          {project.technologies?.length > 0 && (
            <ul className="overlay__techs">
              {project.technologies.map((tech) => (
                <li key={tech} className="chip">
                  {tech}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
