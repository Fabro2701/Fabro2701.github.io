import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Fabrizio — Portfolio",
  description:
    "BS CS · MSc Quant Finance. Trading hero, experience, and projects.",
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
