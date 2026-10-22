import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PulseLedger — Brain-Dump Cashflow & What-If Simulator",
  description:
    "Turn a messy plain-English monthly cashflow summary into structured categories, Safe Daily Allowance vs. Actual Daily Spend, and live What-If expense sliders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${fontSans.variable} ${fontMono.variable}`}>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100">
        {children}
      </body>
    </html>
  );
}
