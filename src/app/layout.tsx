import type { Metadata } from "next";
import {
  Space_Grotesk,
  Plus_Jakarta_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PulseLedger — Form PL-30 // 30-Day Cashflow Triage & Simulation Ledger",
  description:
    "Turn a messy plain-English monthly cashflow statement into structured accounting buckets, Safe Daily Allowance vs. Actual Daily Burn, and live What-If expense sliders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-paper-base font-sans text-ink-primary antialiased">
        {children}
      </body>
    </html>
  );
}
