import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "../globals.css";

const sans = Sora({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Client Portal · SyberInfo",
  robots: { index: false, follow: false },
};

export default function PortalRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${sans.variable} ${mono.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
