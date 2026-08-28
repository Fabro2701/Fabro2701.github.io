"use client";

import { useCallback, useMemo, useRef, useState } from "react";

const DEFAULT_LOT = 10;

export default function useTradingEngine() {
  const [position, setPosition] = useState(null);
  const [lotSize, setLotSize] = useState(DEFAULT_LOT);
  const [realized, setRealized] = useState([]);
  const [log, setLog] = useState([]);
  const lastStepRef = useRef(-1);

  const tick = useCallback(
    (step, currentPrice) => {
      if (step === lastStepRef.current) return;
      lastStepRef.current = step;

      if (position) {
        const pnl =
          (currentPrice - position.entryPrice) *
          position.lotSize *
          (position.side === "LONG" ? 1 : -1);

        setPosition((prev) => (prev ? { ...prev, unrealizedPnL: pnl } : null));
      }
    },
    [position]
  );

  const openPosition = useCallback(
    (step, side, currentPrice) => {
      if (position) return;

      setPosition({
        side,
        entryPrice: currentPrice,
        lotSize,
        unrealizedPnL: 0,
      });

      setLog((prev) => [
        ...prev,
        {
          step,
          text: `${side === "LONG" ? "▲ BUY" : "▼ SELL"} ${lotSize} lots @ ${currentPrice.toFixed(2)}`,
        },
      ]);
    },
    [position, lotSize]
  );

  const closePosition = useCallback(
    (step, currentPrice) => {
      if (!position) return;

      const pnl =
        (currentPrice - position.entryPrice) *
        position.lotSize *
        (position.side === "LONG" ? 1 : -1);

      setRealized((prev) => [
        ...prev,
        {
          step,
          side: position.side,
          entryPrice: position.entryPrice,
          exitPrice: currentPrice,
          lotSize: position.lotSize,
          pnl,
        },
      ]);

      setLog((prev) => [
        ...prev,
        {
          step,
          text: `CLOSE ${position.side} @ ${currentPrice.toFixed(2)} → ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}`,
        },
      ]);

      setPosition(null);
    },
    [position]
  );

  const unrealizedPnL = useMemo(() => {
    return position ? position.unrealizedPnL : 0;
  }, [position]);

  return {
    position,
    lotSize,
    setLotSize,
    realized,
    log,
    unrealizedPnL,
    tick,
    openPosition,
    closePosition,
  };
}
