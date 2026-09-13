"use client";

function formatPnl(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

export default function TradingPanel({
  position,
  lotSize,
  setLotSize,
  unrealizedPnL,
  onOpen,
  onClose,
}) {
  const clampLot = (value) => Math.min(100, Math.max(1, value));

  return (
    <div className="panel">
      {!position ? (
        <div className="panel__row">
          <div className="panel__actions">
            <button
              type="button"
              className="panel__btn panel__btn--buy mono"
              onClick={() => onOpen("LONG")}
            >
              ▲ BUY
            </button>
            <button
              type="button"
              className="panel__btn panel__btn--sell mono"
              onClick={() => onOpen("SHORT")}
            >
              ▼ SELL
            </button>
          </div>

          <div className="panel__lot mono">
            <span className="panel__label">Lots</span>
            <button
              type="button"
              className="panel__lot-btn mono"
              aria-label="Decrease lot size"
              onClick={() => setLotSize((v) => clampLot(v - 1))}
            >
              −
            </button>
            <span className="panel__lot-value">{lotSize}</span>
            <button
              type="button"
              className="panel__lot-btn mono"
              aria-label="Increase lot size"
              onClick={() => setLotSize((v) => clampLot(v + 1))}
            >
              +
            </button>
          </div>

          <span className="panel__hint mono">FLAT</span>
        </div>
      ) : (
        <div className="panel__row panel__row--open">
          <div className="panel__position mono">
            <span className="panel__side" data-side={position.side}>
              {position.side}
            </span>
            <span>
              entry{" "}
              <strong className="panel__entry">{position.entryPrice.toFixed(2)}</strong>
            </span>
            <span>
              unrealized{" "}
              <strong
                className="panel__pnl"
                data-pos={unrealizedPnL >= 0 ? "pos" : "neg"}
              >
                {formatPnl(unrealizedPnL)}
              </strong>
            </span>
          </div>

          <button
            type="button"
            className="panel__close mono"
            aria-label="Close position"
            onClick={onClose}
          >
            ✕ CLOSE
          </button>
        </div>
      )}
    </div>
  );
}
