"use client";

import { useEffect, useMemo, useState } from "react";
import candles from "@/data/price-series.json";
import useTradingEngine from "@/hooks/useTradingEngine";
import TradingPanel from "@/components/TradingPanel";
import PnLChart from "@/components/PnLChart";
import LogConsole from "@/components/LogConsole";

const TICK_MS = 500;
const WINDOW = 60;

const TICKER = "SIM·USD";

const VB_W = 880;
const VB_H = 360;
const PAD_L = 52;
const PAD_R = 64;
const PAD_T = 14;
const PAD_B = 14;
const INNER_W = VB_W - PAD_L - PAD_R;
const INNER_H = VB_H - PAD_T - PAD_B;
const SLOT_W = INNER_W / WINDOW;
const BODY_W = Math.max(2, SLOT_W * 0.55);

const GRID_LINES = 4;

function formatPrice(value) {
  return value.toFixed(2);
}

export default function TradingChart() {
  const [step, setStep] = useState(0);

  const {
    position,
    lotSize,
    setLotSize,
    realized,
    log,
    unrealizedPnL,
    tick,
    openPosition,
    closePosition,
  } = useTradingEngine();

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % candles.length);
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const { start, slice, minP, maxP, current, previous } = useMemo(() => {
    const start = Math.max(0, step - WINDOW + 1);
    const slice = candles.slice(start, step + 1);
    const minP = Math.min(...slice.map((c) => c.low));
    const maxP = Math.max(...slice.map((c) => c.high));
    const current = candles[step];
    const previous = candles[(step - 1 + candles.length) % candles.length];
    return { start, slice, minP, maxP, current, previous };
  }, [step]);

  const loPad = Math.max(0, (maxP - minP) * 0.04) + 1e-9;

  const base = minP - loPad;
  const scale = (maxP - minP + loPad * 2) || 1;

  const yOf = (price) => PAD_T + (1 - (price - base) / scale) * INNER_H;
  const xOf = (index) => PAD_L + (index - start) * SLOT_W + SLOT_W / 2;

  const up = current.close >= current.open;
  const priceUp = current.close >= previous.close;

  const grid = Array.from({ length: GRID_LINES + 1 }, (_, g) => {
    const price = maxP - ((maxP - minP) * g) / GRID_LINES;
    return { price, y: yOf(price) };
  });

  useEffect(() => {
    tick(step, current.close);
  }, [step, current.close, tick]);

  return (
    <div className="chart">
      <div className="chart__top">
        <span className="chart__ticker mono">{TICKER}</span>
        <span className="chart__step mono">[t={String(step).padStart(3, "0")}]</span>
        <span className="chart__price mono" data-up={priceUp ? "true" : "false"}>
          {up ? "▲" : "▼"} {formatPrice(current.close)}
        </span>
      </div>
      <div className="chart__frame">
        <svg
          role="img"
          aria-label={`${TICKER} OHLC ticker, advance ${step} of ${candles.length}, price ${formatPrice(current.close)}`}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="chart__svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {grid.map(({ price, y }) => (
            <line
              key={price}
              x1={PAD_L}
              x2={VB_W - PAD_R}
              y1={y}
              y2={y}
              stroke="var(--grid)"
              strokeWidth="1"
              shapeRendering="crispEdges"
            />
          ))}
          {grid.map(({ price, y }) => (
            <text
              key={price}
              x={PAD_L - 8}
              y={y + 3}
              textAnchor="end"
              fontSize="11"
              fill="var(--muted)"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatPrice(price)}
            </text>
          ))}

          {slice.map((candle, idx) => {
            const index = start + idx;
            const x = xOf(index);
            const color = candle.close >= candle.open ? "var(--up)" : "var(--down)";
            const bodyTop = yOf(Math.max(candle.open, candle.close));
            const bodyBottom = yOf(Math.min(candle.open, candle.close));
            return (
              <g key={index}>
                <line
                  x1={x}
                  x2={x}
                  y1={yOf(candle.high)}
                  y2={yOf(candle.low)}
                  stroke={color}
                  strokeWidth="1"
                />
                <rect
                  x={x - BODY_W / 2}
                  y={bodyTop}
                  width={BODY_W}
                  height={Math.max(1, bodyBottom - bodyTop)}
                  fill={color}
                />
              </g>
            );
          })}

          <line
            x1={xOf(step)}
            x2={xOf(step)}
            y1={PAD_T}
            y2={PAD_T + INNER_H}
            stroke="var(--accent)"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.8"
          />

          <line
            x1={xOf(Math.max(start, step - 1))}
            x2={VB_W - PAD_R}
            y1={yOf(current.close)}
            y2={yOf(current.close)}
            stroke="var(--accent)"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.8"
          />

          <g>
            <rect
              x={VB_W - PAD_R + 8}
              y={yOf(current.close) - 11}
              width={PAD_R - 16}
              height={22}
              rx={3}
              fill="var(--bg)"
              stroke={priceUp ? "var(--up)" : "var(--down)"}
              strokeWidth="1"
            />
            <text
              x={VB_W - PAD_R + 8 + (PAD_R - 16) / 2}
              y={yOf(current.close) + 4}
              textAnchor="middle"
              fontSize="11"
              fill={priceUp ? "var(--up)" : "var(--down)"}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatPrice(current.close)}
            </text>
          </g>

          {position && (
            <line
              x1={PAD_L}
              x2={VB_W - PAD_R}
              y1={yOf(position.entryPrice)}
              y2={yOf(position.entryPrice)}
              stroke="var(--accent)"
              strokeWidth="1"
              strokeDasharray="2 4"
              opacity="0.9"
            />
          )}
        </svg>
      </div>

      <TradingPanel
        position={position}
        lotSize={lotSize}
        setLotSize={setLotSize}
        unrealizedPnL={unrealizedPnL}
        onOpen={(side) => openPosition(step, side, current.close)}
        onClose={() => closePosition(step, current.close)}
      />

      <PnLChart realized={realized} />

      <LogConsole entries={log} />
    </div>
  );
}