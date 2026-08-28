import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "data", "price-series.json");

const N_CANDLES = 250;
const START_PRICE = 100;
const VOL = 0.012;
const DRIFT = 0.0006;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(random) {
  let u = 0;
  let v = 0;
  while (u === 0) u = random();
  while (v === 0) v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const random = mulberry32(20260828);

const candles = [];
let price = START_PRICE;

for (let i = 0; i < N_CANDLES; i++) {
  const open = price;
  const ret = DRIFT + VOL * randn(random);
  const close = open * (1 + ret);
  const spread = VOL * Math.abs(randn(random)) * open;
  const high = Math.max(open, close) + spread;
  const low = Math.min(open, close) - spread;

  candles.push({
    open: round(open),
    high: round(high),
    low: round(low),
    close: round(close),
  });

  price = close;
}

function round(n) {
  return Number(n.toFixed(4));
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(candles, null, 2) + "\n");
console.log(`wrote ${candles.length} candles -> ${OUT}`);