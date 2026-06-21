import { store } from "./site";

export type Service = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string; // emoji glyph kept lightweight (no icon lib dependency)
  features: string[];
  accent: string; // tailwind gradient stops
};

export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Development",
    tagline: "Fast, scalable, built to convert",
    description:
      "Custom websites and web apps engineered for speed, SEO and conversions — from marketing sites to full e-commerce and customer portals.",
    icon: "</>",
    features: [
      "Next.js / React & headless builds",
      "E-commerce & booking systems",
      "WordPress & custom CMS",
      "API & third-party integrations",
    ],
    accent: "from-cyan-glow to-violet-glow",
  },
  {
    slug: "design",
    title: "Design & Branding",
    tagline: "Identities people remember",
    description:
      "UI/UX and brand identity that looks stunning and works flawlessly — wireframes to pixel-perfect, accessible interfaces.",
    icon: "✦",
    features: [
      "Brand identity & logo design",
      "UI/UX & design systems",
      "Landing page design",
      "Print & social creatives",
    ],
    accent: "from-violet-glow to-pink-glow",
  },
  {
    slug: "seo",
    title: "SEO",
    tagline: "Rank higher, earn more traffic",
    description:
      "Technical, on-page and content SEO that lifts your rankings and brings qualified organic traffic that actually converts.",
    icon: "↗",
    features: [
      "Technical SEO audits",
      "Keyword & content strategy",
      "Local SEO & Google Business",
      "Link building & reporting",
    ],
    accent: "from-pink-glow to-cyan-glow",
  },
  {
    slug: "smo",
    title: "Social Media (SMO)",
    tagline: "Build a brand people follow",
    description:
      "Social media optimisation and management that grows your audience and turns followers into customers.",
    icon: "◎",
    features: [
      "Profile & content optimisation",
      "Content calendars & creatives",
      "Community management",
      "Paid social campaigns",
    ],
    accent: "from-cyan-glow to-pink-glow",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    tagline: "Full-funnel growth engine",
    description:
      "Data-driven campaigns across search, social and email that generate leads and measurable ROI for your business.",
    icon: "⚡",
    features: [
      "Google & Meta Ads (PPC)",
      "Email & automation",
      "Conversion rate optimisation",
      "Analytics & growth reporting",
    ],
    accent: "from-violet-glow to-cyan-glow",
  },
];

export type Product = {
  title: string;
  description: string;
  icon: string;
  href: string;
  price?: string;
  highlight?: boolean;
  bullets: string[];
};

export const products: Product[] = [
  {
    title: "Domain Names",
    description: "Register the perfect .com.au, .com or any domain in minutes.",
    icon: "🌐",
    href: store.domains,
    price: "from $14.95/yr",
    bullets: ["Free DNS management", "Domain privacy", "Easy transfers"],
  },
  {
    title: "Web Hosting",
    description: "Blazing-fast, secure hosting with 99.9% uptime and free SSL.",
    icon: "⚡",
    href: store.hosting,
    price: "from $4.95/mo",
    highlight: true,
    bullets: ["Free SSL certificate", "Daily backups", "cPanel control panel"],
  },
  {
    title: "Linux Hosting",
    description: "High-performance Linux servers tuned for speed and stability.",
    icon: "🐧",
    href: store.linux,
    price: "from $6.95/mo",
    bullets: ["SSD storage", "LiteSpeed / Apache", "SSH access"],
  },
  {
    title: "Google Workspace",
    description: "Professional email, Docs, Drive & Meet on your own domain.",
    icon: "✉️",
    href: store.google,
    price: "from $8.40/user/mo",
    bullets: ["Business email", "30GB+ storage", "Gemini & Meet"],
  },
  {
    title: "Microsoft 365",
    description: "Outlook, Teams, Office apps and OneDrive for your team.",
    icon: "🪟",
    href: store.microsoft,
    price: "from $9.50/user/mo",
    bullets: ["Outlook email", "Teams & Office", "1TB OneDrive"],
  },
];

export const stats = [
  { value: "250+", label: "Projects delivered" },
  { value: "99.9%", label: "Hosting uptime" },
  { value: "10+", label: "Years experience" },
  { value: "24/7", label: "Support" },
];

export const steps = [
  {
    n: "01",
    title: "Discover",
    text: "We learn your business, goals and audience to shape the right strategy.",
  },
  {
    n: "02",
    title: "Design",
    text: "We craft a creative direction and prototypes you can see and feel.",
  },
  {
    n: "03",
    title: "Develop",
    text: "We build fast, secure, SEO-ready experiences that scale with you.",
  },
  {
    n: "04",
    title: "Grow",
    text: "We launch, optimise and market — turning traffic into customers.",
  },
];

export const testimonials = [
  {
    quote:
      "SyberInfo rebuilt our site and our enquiries doubled in three months. The SEO results speak for themselves.",
    name: "Priya M.",
    role: "Founder, Retail Co.",
  },
  {
    quote:
      "Reliable hosting, fast support and a beautiful website. Everything we need under one roof.",
    name: "James T.",
    role: "Director, Trades Group",
  },
  {
    quote:
      "Their digital marketing team is sharp. Clear reporting and real ROI from day one.",
    name: "Aisha K.",
    role: "Marketing Lead, Services Firm",
  },
];
