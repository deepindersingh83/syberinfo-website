/**
 * Central place for brand info, navigation and external links.
 * Update these once and they propagate across the whole site.
 */
export const site = {
  name: "SyberInfo",
  legalName: "SyberInfo Pty Ltd",
  domain: "syberinfo.com.au",
  url: "https://syberinfo.com.au",
  tagline: "IT that quietly runs while you build.",
  description:
    "SyberInfo delivers managed IT, cloud and cybersecurity for growing Australian businesses. We handle the infrastructure, the threats and the 2am alerts — so your team never has to think about any of it.",
  email: "info@syberinfo.com.au",
  phone: "0422 994 009",
  phoneIntl: "+61422994009",
  // Australian business details (edit these). ABN shown in footer + schema.
  abn: "00 000 000 000",
  australianOwned: true,
  dataLocation: "Australia",
  address: "Lyndhurst VIC 3975",
  founded: "2015",
  // WhatsApp number in international format, digits only (no + or spaces).
  // Leave empty to hide the floating WhatsApp button. e.g. "61400000000"
  whatsapp: "61422994009",
  // Public status/uptime page. This project ships its own /status page.
  statusUrl: "/status",
  location: "Lyndhurst, Melbourne, VIC",
  // Client portal ships in-app at /portal
  storeUrl: "/portal",
  social: {
    linkedin: "https://www.linkedin.com/company/syber-info-0366bb291/",
    twitter: "https://twitter.com/SyberInfo",
    github: "",
    facebook: "https://facebook.com/syberinfo.com.au",
    instagram: "https://instagram.com/syberinfo/",
  },
  /**
   * Local-SEO facts used to build LocalBusiness / ProfessionalService schema
   * and the local landing pages. Coordinates are for Lyndhurst, VIC.
   */
  local: {
    suburb: "Lyndhurst",
    state: "VIC",
    stateFull: "Victoria",
    postcode: "3975",
    region: "South East Melbourne",
    geo: { lat: -38.0716, lng: 145.2588 },
    priceRange: "$$",
    // schema.org openingHours strings.
    openingHours: ["Mo-Fr 09:00-19:00"],
    hoursHuman: "Mon–Fri, 9am–7pm",
  },
} as const;

/**
 * URL for the branded, on-demand Open Graph card (see /api/og). Pass a page
 * title (and optional kicker) so links unfurl with a relevant image.
 */
export function ogImage(title?: string, kicker?: string): string {
  const q = new URLSearchParams();
  if (title) q.set("title", title);
  if (kicker) q.set("kicker", kicker);
  const qs = q.toString();
  return `${site.url}/api/og${qs ? `?${qs}` : ""}`;
}

export const nav = [
  { label: "Services", href: "/services" },
  { label: "Case studies", href: "/work" },
  { label: "Insights", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

// Secondary links surfaced in the footer.
export const legalNav = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

/** Footer link columns. */
export const footerCols = [
  {
    head: "SERVICES",
    links: [
      { label: "Managed IT", href: "/services/managed" },
      { label: "Cloud & Infrastructure", href: "/services/cloud" },
      { label: "Cybersecurity", href: "/services/security" },
      { label: "Backup & Recovery", href: "/services/backup" },
    ],
  },
  {
    head: "COMPANY",
    links: [
      { label: "About us", href: "/about" },
      { label: "Case studies", href: "/work" },
      { label: "Careers", href: "/careers" },
      { label: "Insights", href: "/blog" },
      { label: "Essential Eight check", href: "/essential-eight" },
    ],
  },
  {
    head: "GET IN TOUCH",
    links: [
      { label: "info@syberinfo.com.au", href: "mailto:info@syberinfo.com.au" },
      { label: "0422 994 009", href: "tel:+61422994009" },
      { label: "Contact us", href: "/contact" },
      { label: "Client portal", href: "/portal" },
    ],
  },
] as const;

/** Quick links (client portal now lives in-app). */
export const store = {
  login: "/portal",
  book: "/book",
  // Product order links now route into the in-app portal software marketplace.
  domains: "/portal",
  hosting: "/portal",
  linux: "/portal",
  google: "/portal",
  microsoft: "/portal",
} as const;
