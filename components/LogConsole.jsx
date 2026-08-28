"use client";

import { useEffect, useRef } from "react";

export default function LogConsole({ entries }) {
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  return (
    <div className="log">
      <div className="log__header mono">LOG</div>
      <div
        ref={listRef}
        className="log__body mono"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {entries.length === 0 ? (
          <div className="log__entry log__entry--muted">— waiting for actions —</div>
        ) : (
          entries.map((e, i) => (
            <div key={i} className="log__entry">
              <span className="log__step">[t={String(e.step).padStart(3, "0")}]</span>{" "}
              {e.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
