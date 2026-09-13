"use client";

import { useCallback, useMemo, useRef, useState } from "react";

const DEFAULT_LOT = 5;

export default function useTradingEngine() {
  const [position, setPosition] = useState(null);
  const [lotSize, setLotSize] = useState(DEFAULT_LOT);
  const [realized, setRealized] = useState([]);
  const [pnlHistory, setPnlHistory] = useState([]);
  const [log, setLog] = useState([]);
  const lastStepRef = useRef(-1);
  const realizedRef = useRef(0);

  const tick = useCallback(
    (step, currentPrice) => {
      if (step === lastStepRef.current) return;
      lastStepRef.current = step;

      let openPnL = 0;
      if (position) {
        openPnL =
          (currentPrice - position.entryPrice) *
          position.lotSize *
          (position.side === "LONG" ? 1 : -1);

        setPosition((prev) => (prev ? { ...prev, unrealizedPnL: openPnL } : null));
      }

      const net = realizedRef.current + openPnL;
      setPnlHistory((prev) => [...prev, { step, value: net }]);
    },
    [position]
  );

  const openPosition = useCallback(
    (step, side, currentPrice) => {
      if (position) return;

      setPosition({
        side,
        entryStep: step,
        entryPrice: currentPrice,
        lotSize,
        unrealizedPnL: 0,
      });

      setLog((prev) => [
        ...prev,
        {
          step,
          tone: side === "LONG" ? "long" : "short",
          action: side === "LONG" ? "▲ BUY" : "▼ SELL",
          text: `${lotSize} lots @ ${currentPrice.toFixed(2)}`,
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
          entryStep: position.entryStep,
          side: position.side,
          entryPrice: position.entryPrice,
          exitPrice: currentPrice,
          lotSize: position.lotSize,
          pnl,
        },
      ]);

      realizedRef.current += pnl;

      setPnlHistory((prev) => [
        ...prev,
        { step, value: realizedRef.current },
      ]);

      setLog((prev) => [
        ...prev,
        {
          step,
          tone: "close",
          action: "CLOSE",
          text: `${position.side} @ ${currentPrice.toFixed(2)} → ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}`,
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
    pnlHistory,
    log,
    unrealizedPnL,
    tick,
    openPosition,
    closePosition,
  };
}
