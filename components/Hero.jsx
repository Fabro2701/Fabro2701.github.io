import TradingChart from "@/components/TradingChart";

export default function Hero() {
  return (
    <>
      <h1 style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
        Hi, I&apos;m Fabrizio
      </h1>
      <p className="section__tag">BS CS · MSc Quant Finance</p>
      <TradingChart />
    </>
  );
}
