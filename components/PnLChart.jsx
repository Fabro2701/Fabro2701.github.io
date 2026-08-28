"use client";

import { useMemo } from "react";

const VB_W = 880;
const VB_H = 150;
const PAD_L = 44;
const PAD_R = 12;
const PAD_T = 10;
const PAD_B = 22;
const INNER_W = VB_W - PAD_L - PAD_R;
const INNER_H = VB_H - PAD_T - PAD_B;

const MAX_STEP = 249;
const X_TICKS = 5;
const Y_TICKS = 4;

function formatPnl(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

export default function PnLChart({ realized, pnlHistory, step }) {
  const { realizedPath, unrealizedPath, yOf, yTicks, xTicks, zeroY, total } = useMemo(() => {
    const N = step;

    const realizedAt = [];
    for (let t = 0; t <= N; t++) {
      let cum = 0;
      for (const tr of realized) {
        if (tr.step <= t) cum += tr.pnl;
      }
      realizedAt.push({ t, value: cum });
    }

    const unrealized = pnlHistory.filter((p) => p.step <= N);

    let minV = 0;
    let maxV = 0;
    for (const p of realizedAt) {
      minV = Math.min(minV, p.value);
      maxV = Math.max(maxV, p.value);
    }
    for (const p of unrealized) {
      minV = Math.min(minV, p.value);
      maxV = Math.max(maxV, p.value);
    }
    if (minV === maxV) {
      minV -= 1;
      maxV += 1;
    }
    const pad = (maxV - minV) * 0.1;
    minV -= pad;
    maxV += pad;
    const span = maxV - minV || 1;

    const yOf = (v) => PAD_T + (1 - (v - minV) / span) * INNER_H;
    const xOf = (t) => PAD_L + (INNER_W * t) / MAX_STEP;

    const realizedPath = realizedAt
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.t).toFixed(2)} ${yOf(p.value).toFixed(2)}`)
      .join(" ");

    const unrealizedPath = unrealized
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.step).toFixed(2)} ${yOf(p.value).toFixed(2)}`)
      .join(" ");

    const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => {
      const v = maxV - ((maxV - minV) * i) / Y_TICKS;
      return { v, y: yOf(v) };
    });
    const xTicks = Array.from({ length: X_TICKS + 1 }, (_, i) => {
      const t = Math.round((MAX_STEP * i) / X_TICKS);
      return { t, x: xOf(t) };
    });

    return {
      realizedPath,
      unrealizedPath,
      yOf,
      yTicks,
      xTicks,
      zeroY: yOf(0),
      total: unrealized.length ? unrealized[unrealized.length - 1].value : 0,
    };
  }, [realized, pnlHistory, step]);

  return (
    <div className="pnl">
      <div className="pnl__header mono">
        <span className="pnl__legend">
          <span className="pnl__legend-line pnl__legend-line--realized" /> REALIZED
          <span className="pnl__legend-line pnl__legend-line--unrealized" /> OPEN
        </span>
        <span className="pnl__total" data-pos={total >= 0 ? "pos" : "neg"}>
          {formatPnl(total)}
        </span>
      </div>
      <div className="pnl__frame">
        <svg
          role="img"
          aria-label={`PnL chart, realized ${formatPnl(total)}, unrealized recorded across ${pnlHistory.length} steps`}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="pnl__svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {yTicks.map(({ v, y }) => (
            <g key={v}>
              <line
                x1={PAD_L}
                x2={VB_W - PAD_R}
                y1={y}
                y2={y}
                stroke="var(--grid)"
                strokeWidth="1"
                shapeRendering="crispEdges"
              />
              <text
                x={PAD_L - 7}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="var(--muted)"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {v === 0 ? "0" : formatPnl(v)}
              </text>
            </g>
          ))}

          <line
            x1={PAD_L}
            x2={VB_W - PAD_R}
            y1={zeroY}
            y2={zeroY}
            stroke="var(--muted)"
            strokeWidth="1"
            opacity="0.5"
            shapeRendering="crispEdges"
          />

          {xTicks.map(({ t, x }) => (
            <g key={t}>
              <line
                x1={x}
                x2={x}
                y1={PAD_T}
                y2={PAD_T + INNER_H}
                stroke="var(--grid)"
                strokeWidth="1"
                opacity="0.5"
                shapeRendering="crispEdges"
              />
              <text
                x={x}
                y={PAD_T + INNER_H + 13}
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted)"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {t}
              </text>
            </g>
          ))}

          <path d={realizedPath} fill="none" stroke="var(--accent)" strokeWidth="2" />

          {unrealizedPath && (
            <path
              d={unrealizedPath}
              fill="none"
              stroke="var(--live)"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
