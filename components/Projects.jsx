"use client";

import { useEffect, useState } from "react";
import projects from "@/data/projects.json";
import ProjectOverlay from "@/components/ProjectOverlay";

const BASE = "/portfolio";

function resolve(src) {
  return `${BASE}/${src.replace(/^\//, "")}`;
}

export default function Projects() {
  const [activeId, setActiveId] = useState(null);

  const active = projects.find((p) => p.id === activeId) || null;

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <h2>Projects</h2>
      <ul className="projects__grid">
        {projects.map((project, index) =>
          project.comingSoon ? (
            <li key={project.id} className="project-card project-card--soon">
              <span className="project-card__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolve(project.images[0])}
                  alt=""
                  loading="lazy"
                  draggable={false}
                />
              </span>
              <span className="project-card__title">{project.title}</span>
            </li>
          ) : (
            <li key={project.id}>
              <button
                type="button"
                className="project-card"
                onClick={() => setActiveId(project.id)}
                aria-haspopup="dialog"
              >
                <span className="project-card__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolve(project.images[0])}
                    alt=""
                    loading="lazy"
                    draggable={false}
                  />
                </span>
                <span className="project-card__title">
                  {project.title}
                  <span className="project-card__date mono">{project.startDate}</span>
                </span>
              </button>
            </li>
          )
        )}
      </ul>
      {active && (
        <ProjectOverlay
          project={active}
          srcs={active.images.map(resolve)}
          onClose={() => setActiveId(null)}
        />
      )}
    </>
  );
}
