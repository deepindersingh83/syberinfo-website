import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveBackground from "@/components/InteractiveBackground";
import ScrollToTop from "@/components/ScrollToTop";
import MobileCTA from "@/components/MobileCTA";
import CookieConsent from "@/components/CookieConsent";
import Attribution from "@/components/Attribution";
import { site, ogImage } from "@/lib/site";
import { getSettings } from "@/lib/settings";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Managed IT, Cloud & Cybersecurity for Australian business`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "managed IT services",
    "managed service provider",
    "cybersecurity",
    "cloud migration",
    "Microsoft 365",
    "Azure",
    "backup and disaster recovery",
    "IT support Melbourne",
    "Essential Eight",
    "vCIO",
    "Australia",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — IT that quietly runs while you build`,
    description: site.description,
    images: [{ url: ogImage("IT that quietly runs while you build", "SyberInfo"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — IT that quietly runs while you build`,
    description: site.description,
    images: [ogImage("IT that quietly runs while you build", "SyberInfo")],
  },
  alternates: { canonical: site.url },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const s = await getSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    name: s.name,
    url: site.url,
    email: s.email,
    telephone: s.phone,
    description: s.description,
    areaServed: "AU",
    address: { "@type": "PostalAddress", streetAddress: s.address || undefined, addressCountry: "AU" },
    identifier: { "@type": "PropertyValue", propertyID: "ABN", value: s.abn },
    sameAs: [s.social.linkedin, s.social.twitter, s.social.github, s.social.facebook, s.social.instagram].filter(Boolean),
    makesOffer: [
      "Managed IT & Support",
      "Cloud & Infrastructure",
      "Cybersecurity",
      "Backup & Recovery",
      "Networks & VoIP",
      "IT Strategy & vCIO",
    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
  };
  return (
    <html
      lang="en-AU"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="relative min-h-full overflow-x-hidden antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <InteractiveBackground />
        <TopBar />
        <Navbar />
        <main className="relative z-[1]">{children}</main>
        <Footer />
        <ScrollToTop />
        <MobileCTA />
        <CookieConsent />
        <Attribution />
      </body>
    </html>
  );
}
