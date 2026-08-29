"use client";

import { useEffect, useRef, useState } from "react";
import experience from "@/data/experience.json";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function startKey(value) {
  const match = String(value).match(/^(\d{2})\.(\d{4})$/);
  if (match) return Number(`${match[2]}${match[1]}`);
  return Number(`${value}00`);
}

function formatDate(value) {
  const match = String(value).match(/^(\d{2})\.(\d{4})$/);
  if (match) return `${MONTHS[Number(match[1]) - 1]} ${match[2]}`;
  return String(value);
}

function formatRange(start, end) {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

const sorted = [...experience].sort((a, b) => startKey(b.start) - startKey(a.start));

export default function Timeline() {
  const listRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setReady(true);
    const el = listRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <h2>Experience</h2>
      <p className="section__tag">merged education &amp; work · newest first</p>
      <ol
        ref={listRef}
        className={`timeline${ready ? " timeline--js" : ""}${inView ? " timeline--in" : ""}`}
      >
        {sorted.map(({ start, end, title, company, skills, kind }, index) => (
          <li key={`${title}-${start}`} className="timeline__item" style={{ "--i": index }}>
            <div className="timeline__meta">
              <span className="timeline__date">{formatRange(start, end)}</span>
              {kind && (
                <span className="timeline__kind" data-kind={kind}>
                  {kind}
                </span>
              )}
            </div>
            <h3 className="timeline__title">{title}</h3>
            <p className="timeline__company">{company}</p>
            {skills?.length > 0 && (
              <ul className="timeline__skills">
                {skills.map((skill) => (
                  <li key={skill} className="chip">
                    {skill}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}