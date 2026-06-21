import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

const sans = Sora({
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
    default: `${site.name} — Web Development, Design, SEO & Digital Marketing`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "web development",
    "web design",
    "SEO",
    "SMO",
    "digital marketing",
    "domain registration",
    "web hosting",
    "linux hosting",
    "Google Workspace reseller",
    "Microsoft 365 reseller",
    "Australia",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Web. Design. Growth.`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Web. Design. Growth.`,
    description: site.description,
  },
  alternates: { canonical: site.url },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  url: site.url,
  email: site.email,
  description: site.description,
  areaServed: "AU",
  address: { "@type": "PostalAddress", addressCountry: "AU" },
  sameAs: Object.values(site.social),
  makesOffer: [
    "Web Development",
    "Web Design",
    "SEO",
    "Social Media Optimisation",
    "Digital Marketing",
    "Domain Registration",
    "Web Hosting",
    "Google Workspace",
    "Microsoft 365",
  ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${sans.variable} ${mono.variable} h-full`}>
      <body className="min-h-full overflow-x-hidden antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
