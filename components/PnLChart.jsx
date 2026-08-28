"use client";

import { useMemo } from "react";

const VB_W = 880;
const VB_H = 140;
const PAD_L = 44;
const PAD_R = 12;
const PAD_T = 10;
const PAD_B = 18;
const INNER_W = VB_W - PAD_L - PAD_R;
const INNER_H = VB_H - PAD_T - PAD_B;

function formatPnl(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

export default function PnLChart({ realized }) {
  const data = useMemo(() => {
    if (!realized.length) return null;

    let cum = 0;
    const points = realized.map((t) => {
      cum += t.pnl;
      return { ...t, cum };
    });

    let min = Infinity;
    let max = -Infinity;
    points.forEach((p) => {
      min = Math.min(min, p.pnl, p.cum);
      max = Math.max(max, p.pnl, p.cum);
    });

    if (min === max) {
      min -= 1;
      max += 1;
    }
    const pad = (max - min) * 0.1;
    min -= pad;
    max += pad;
    const span = max - min || 1;

    const yOf = (v) => PAD_T + (1 - (v - min) / span) * INNER_H;
    const xOf = (i) => PAD_L + (INNER_W * i) / Math.max(1, points.length - 1);

    return { points, min, max, span, yOf, xOf };
  }, [realized]);

  if (!data) {
    return (
      <div className="pnl">
        <div className="pnl__header mono">REALIZED PnL</div>
        <div className="pnl__frame pnl__frame--empty mono">
          No trades yet — open a position to see realized PnL.
        </div>
      </div>
    );
  }

  const { points, yOf, xOf, span, min } = data;
  const slotW = INNER_W / Math.max(1, points.length);
  const barW = Math.max(2, slotW * 0.6);
  const zeroY = yOf(0);
  const total = points[points.length - 1].cum;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(2)} ${yOf(p.cum).toFixed(2)}`)
    .join(" ");

  return (
    <div className="pnl">
      <div className="pnl__header mono">
        <span>REALIZED PnL</span>
        <span className="pnl__total" data-pos={total >= 0 ? "pos" : "neg"}>
          {formatPnl(total)}
        </span>
      </div>
      <div className="pnl__frame">
        <svg
          role="img"
          aria-label={`Realized PnL bar chart, ${points.length} trades, cumulative ${formatPnl(total)}`}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="pnl__svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <line
            x1={PAD_L}
            x2={VB_W - PAD_R}
            y1={zeroY}
            y2={zeroY}
            stroke="var(--grid)"
            strokeWidth="1"
            shapeRendering="crispEdges"
          />

          {points.map((p, i) => {
            const y = yOf(p.pnl);
            const h = Math.max(1, Math.abs(y - zeroY));
            return (
              <rect
                key={i}
                x={PAD_L + i * slotW + (slotW - barW) / 2}
                y={p.pnl >= 0 ? y : zeroY}
                width={barW}
                height={h}
                fill={p.pnl >= 0 ? "var(--up)" : "var(--down)"}
                opacity="0.85"
              />
            );
          })}

          <path
            d={linePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
