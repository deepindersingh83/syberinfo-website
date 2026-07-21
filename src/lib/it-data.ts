import type { Service, Post, Project, Partner } from "./data";

/* ============================================================================
   SyberInfo — managed IT / cloud / cybersecurity content.
   This is the static source that the CMS accessors fall back to and that the
   marketing pages read. Everything here is editable at /admin once seeded.
========================================================================== */

const INDIGO = "#5e5bff";
const LIME = "#c9f25e";
const TINT_INDIGO = "rgba(94,91,255,.14)";
const TINT_LIME = "rgba(201,242,94,.12)";

/* ---------------------------------- Stats --------------------------------- */
export const stats = [
  { value: "99.98%", label: "Monitored uptime across managed clients" },
  { value: "<8 min", label: "Average response to critical alerts" },
  { value: "120+", label: "Endpoints under active management" },
  { value: "11 yrs", label: "Keeping Australian teams online" },
];

export const marquee = [
  "Managed IT",
  "Microsoft 365",
  "Cloud Migration",
  "Cybersecurity",
  "Backup & DR",
  "Network Design",
  "Endpoint Security",
  "Helpdesk",
  "VoIP",
  "Compliance",
];

export const clientLogos = [
  { mark: "◈", name: "Meridian Health" },
  { mark: "◉", name: "Northwind Studio" },
  { mark: "▰", name: "Harbourline" },
  { mark: "✦", name: "Kestrel SaaS" },
  { mark: "◐", name: "Fenwick & Co" },
  { mark: "⬢", name: "Brightpath" },
  { mark: "◆", name: "Loop Logistics" },
  { mark: "⬡", name: "Vantage Legal" },
  { mark: "◑", name: "Corella Dental" },
];

export const values = [
  { k: "⚡", t: "Proactive", d: "We catch issues before they become outages." },
  { k: "◎", t: "Plain-spoken", d: "No jargon walls — just clear advice." },
  { k: "⛨", t: "Security-first", d: "Defence baked into everything we build." },
  { k: "✶", t: "Local", d: "Melbourne-based engineers, real people." },
];

/* -------------------------------- Services -------------------------------- */
export const services: Service[] = [
  {
    slug: "managed",
    title: "Managed IT & Support",
    tagline: "A full IT department, without the headcount",
    description:
      "Proactive monitoring, patching, and a real helpdesk your team can reach. We fix problems before you notice them.",
    overview:
      "A complete outsourced IT department — proactive monitoring, fast helpdesk, and an engineer who knows your business.",
    lead: "A complete outsourced IT department — proactive monitoring, fast helpdesk, and an engineer who knows your business. We catch and fix issues before they ever reach your team.",
    icon: "{}",
    accent: "from-indigo to-indigo",
    accentHex: INDIGO,
    tintHex: TINT_INDIGO,
    short: "managed IT",
    features: [
      "Proactive 24/7 monitoring",
      "Unlimited helpdesk",
      "Patch management",
      "Asset & license tracking",
    ],
    benefits: [
      "Issues fixed before they reach your team",
      "Predictable monthly cost per seat",
      "Real humans, fast response, no per-ticket fees",
      "Full visibility of every device and license",
    ],
    keyFeatures: [
      { title: "Proactive monitoring", body: "We watch your systems 24/7 and act on alerts automatically." },
      { title: "Unlimited helpdesk", body: "Real humans, fast response, no per-ticket fees." },
      { title: "Patch management", body: "Every device kept current and secure." },
      { title: "Asset tracking", body: "Full inventory of devices, warranties and licenses." },
    ],
    metrics: [
      { k: "<8 min", v: "Avg response" },
      { k: "99.98%", v: "Uptime" },
      { k: "120+", v: "Endpoints" },
    ],
    sections: [
      { heading: "Support that shows up early", body: "Most IT support only appears once something is already broken. We flipped that model — monitoring agents on every device surface trouble the moment it starts, and our team acts on it automatically, often before you'd have noticed." },
      { heading: "A helpdesk that feels in-house", body: "Unlimited helpdesk is included in every plan. Your staff reach real engineers by phone, email or portal, with an average response under eight minutes on critical issues." },
    ],
    faqs: [
      { question: "How fast do you respond when something breaks?", answer: "Critical issues get a response in under 8 minutes on average, 24/7. Standard requests are typically actioned within the hour during business hours — all through unlimited helpdesk included in every plan." },
      { question: "Do you work with our existing tools?", answer: "Almost certainly. We manage Microsoft 365, Google Workspace, Azure, common line-of-business apps, and a wide range of hardware. If it runs your business, we can support it." },
    ],
  },
  {
    slug: "cloud",
    title: "Cloud & Infrastructure",
    tagline: "Migrations done without downtime",
    description:
      "Migrations to Azure & Microsoft 365, done without downtime — plus the architecture to keep it fast and lean.",
    overview:
      "Migrations to Microsoft 365 and Azure done without downtime — plus the architecture and ongoing tuning to keep your cloud fast, lean and cost-effective.",
    lead: "Migrations to Microsoft 365 and Azure done without downtime — plus the architecture and ongoing tuning to keep your cloud fast, lean and cost-effective.",
    icon: "☁",
    accent: "from-lime to-lime",
    accentHex: LIME,
    tintHex: TINT_LIME,
    short: "cloud",
    features: ["Zero-downtime migration", "Microsoft 365 & Azure", "Cost optimisation", "Hybrid setups"],
    benefits: [
      "Move over evenings and weekends — no disruption",
      "Right-sized resources, no waste",
      "On-prem and cloud working as one",
      "Lower, predictable monthly cloud spend",
    ],
    keyFeatures: [
      { title: "Zero-downtime migration", body: "We move you over evenings and weekends." },
      { title: "Microsoft 365 & Azure", body: "Licensing, setup and optimisation." },
      { title: "Cost optimisation", body: "Right-sized resources, no waste." },
      { title: "Hybrid setups", body: "On-prem and cloud working as one." },
    ],
    metrics: [
      { k: "0 hrs", v: "Migration downtime" },
      { k: "38%", v: "Avg cost saving" },
      { k: "40+", v: "Cloud projects" },
    ],
    sections: [
      { heading: "Migrations, minus the drama", body: "We plan every cutover in detail and run it out of hours, so your team logs in on Monday to a faster setup — not a broken one." },
      { heading: "Architecture that stays lean", body: "Cloud bills creep. We right-size resources, retire what's idle, and review your tenancy every quarter to keep spend under control." },
    ],
    faqs: [
      { question: "Will there be downtime during migration?", answer: "We design migrations to run out of hours — evenings and weekends — with staff tested before the next business day. Most clients experience zero downtime." },
      { question: "Can you help lower our cloud bill?", answer: "Yes. A quarterly tenancy review typically finds 20–40% in savings from over-provisioned VMs and orphaned resources. We do this automatically for managed clients." },
    ],
  },
  {
    slug: "security",
    title: "Cybersecurity",
    tagline: "Layered defence built for SMBs",
    description:
      "Layered defence: endpoint protection, MFA, phishing simulation, and 24/7 threat monitoring built for SMBs.",
    overview:
      "Layered defence built for SMBs: endpoint protection, MFA, phishing simulation, and round-the-clock threat monitoring — aligned to the Essential Eight.",
    lead: "Layered defence built for SMBs: endpoint protection, MFA, phishing simulation, and round-the-clock threat monitoring — aligned to the Essential Eight.",
    icon: "⚿",
    accent: "from-indigo to-indigo",
    accentHex: INDIGO,
    tintHex: TINT_INDIGO,
    short: "cybersecurity",
    features: ["Endpoint detection & response", "MFA everywhere", "Phishing simulation", "Essential Eight uplift"],
    benefits: [
      "Stop credential theft at the door",
      "EDR on every device, always watching",
      "Staff who spot and report phishing",
      "Compliance reporting insurers accept",
    ],
    keyFeatures: [
      { title: "Endpoint detection", body: "EDR on every device, always watching." },
      { title: "MFA everywhere", body: "Stop credential theft at the door." },
      { title: "Phishing training", body: "Automated staff simulations and coaching." },
      { title: "Essential Eight", body: "Compliance reporting and uplift." },
    ],
    metrics: [
      { k: "24/7", v: "Monitoring" },
      { k: "100%", v: "MFA coverage" },
      { k: "0", v: "Client breaches" },
    ],
    sections: [
      { heading: "Defence in depth", body: "No single control stops every attack, so we layer them: MFA on every account, EDR on every device, email authentication to block spoofing, and monitoring that never sleeps." },
      { heading: "Compliance without the headache", body: "We align your setup to the ACSC Essential Eight and produce reporting you can hand straight to auditors or your cyber insurer." },
    ],
    faqs: [
      { question: "Can you help with compliance and cyber insurance?", answer: "Yes — we align your setup to frameworks like the Essential Eight and help you meet the security controls insurers now require, with reporting you can hand straight to auditors." },
      { question: "What happens if we're attacked?", answer: "With 24/7 monitoring we detect and contain threats fast, and tested immutable backups mean recovery is a process, not a ransom negotiation." },
    ],
  },
  {
    slug: "backup",
    title: "Backup & Recovery",
    tagline: "A recovery plan you can rely on",
    description:
      "Automated, tested backups with a recovery plan you can actually rely on when the worst day arrives.",
    overview:
      "Automated, tested backups with a recovery plan you can actually rely on. When the worst day comes, you'll be back online in minutes — not days.",
    lead: "Automated, tested backups with a recovery plan you can actually rely on. When the worst day comes, you'll be back online in minutes — not days.",
    icon: "↺",
    accent: "from-lime to-lime",
    accentHex: LIME,
    tintHex: TINT_LIME,
    short: "backup",
    features: ["Automated backups", "Tested restores", "Rapid recovery", "Ransomware-ready"],
    benefits: [
      "Daily, encrypted, off-site copies",
      "Recoverability verified monthly",
      "RTOs measured in minutes",
      "Immutable copies that can't be encrypted",
    ],
    keyFeatures: [
      { title: "Automated backups", body: "Daily, encrypted, off-site." },
      { title: "Tested restores", body: "We verify recoverability monthly." },
      { title: "Rapid recovery", body: "RTOs measured in minutes." },
      { title: "Ransomware-ready", body: "Immutable copies that can't be encrypted." },
    ],
    metrics: [
      { k: "15 min", v: "Recovery time" },
      { k: "Daily", v: "Backups" },
      { k: "2TB+", v: "Protected" },
    ],
    sections: [
      { heading: "Backups you can actually restore", body: "A backup you've never restored is a hope, not a plan. We run test restores every month, so 'we have backups' actually means 'we can recover'." },
      { heading: "Ready for ransomware", body: "Immutable, off-site copies can't be encrypted by an attacker — so recovery is a calm, tested process rather than a negotiation." },
    ],
    faqs: [
      { question: "How quickly can you restore our data?", answer: "Recovery time objectives are measured in minutes for most scenarios. We design your plan around the systems you can least afford to lose." },
      { question: "Do you test the backups?", answer: "Yes — every managed client gets a monthly test restore so we know recoverability is real, not assumed." },
    ],
  },
  {
    slug: "network",
    title: "Networks & VoIP",
    tagline: "Connectivity that follows your team",
    description:
      "Wi-Fi that reaches every corner, secure networks, and cloud phone systems that follow your team anywhere.",
    overview:
      "Wi-Fi that reaches every corner, secure segmented networks, and cloud phone systems that follow your team wherever they work.",
    lead: "Wi-Fi that reaches every corner, secure segmented networks, and cloud phone systems that follow your team wherever they work.",
    icon: "⊞",
    accent: "from-indigo to-indigo",
    accentHex: INDIGO,
    tintHex: TINT_INDIGO,
    short: "networks",
    features: ["Business-grade Wi-Fi", "Secure segmented networks", "Cloud VoIP", "SD-WAN"],
    benefits: [
      "Coverage and speed in every room",
      "Segmentation and firewall management",
      "AU numbers, softphones, call flows",
      "Reliable multi-site connectivity",
    ],
    keyFeatures: [
      { title: "Business-grade Wi-Fi", body: "Coverage and speed in every room." },
      { title: "Secure networks", body: "Segmentation and firewall management." },
      { title: "Cloud VoIP", body: "AU numbers, softphones, call flows." },
      { title: "SD-WAN", body: "Reliable multi-site connectivity." },
    ],
    metrics: [
      { k: "99.9%", v: "Network uptime" },
      { k: "12+", v: "Sites connected" },
      { k: "AU", v: "Local numbers" },
    ],
    sections: [
      { heading: "Networks that just work", body: "Segmented, firewalled and monitored — with business-grade Wi-Fi that reaches every corner of every site." },
      { heading: "Phones that follow you", body: "Cloud VoIP with Australian numbers and softphones means your team takes their extension anywhere, on any device." },
    ],
    faqs: [
      { question: "Can staff use their office number from home?", answer: "Yes — our cloud VoIP runs on softphones and mobile apps, so your extension and AU number follow you to any location." },
      { question: "Do you manage multi-site connectivity?", answer: "We design and manage SD-WAN and secure networks across as many sites as you have, with monitoring on every link." },
    ],
  },
  {
    slug: "strategy",
    title: "IT Strategy & vCIO",
    tagline: "A roadmap aligned to your growth",
    description:
      "A technology roadmap aligned to where your business is going — budgets, risk, and growth, all planned ahead.",
    overview:
      "A technology roadmap aligned to where your business is heading. Quarterly planning on budgets, risk and growth — so IT becomes an advantage, not an afterthought.",
    lead: "A technology roadmap aligned to where your business is heading. Quarterly planning on budgets, risk and growth — so IT becomes an advantage, not an afterthought.",
    icon: "✦",
    accent: "from-lime to-lime",
    accentHex: LIME,
    tintHex: TINT_LIME,
    short: "IT strategy",
    features: ["Quarterly roadmaps", "Budget planning", "Risk reviews", "Vendor management"],
    benefits: [
      "Planned investment, no surprises",
      "Predictable IT spend year-round",
      "Know your exposure and fix it",
      "We handle your tech suppliers",
    ],
    keyFeatures: [
      { title: "Quarterly roadmaps", body: "Planned investment, no surprises." },
      { title: "Budget planning", body: "Predictable IT spend year-round." },
      { title: "Risk reviews", body: "Know your exposure and fix it." },
      { title: "Vendor management", body: "We handle your tech suppliers." },
    ],
    metrics: [
      { k: "4×/yr", v: "Strategy reviews" },
      { k: "3-yr", v: "Roadmaps" },
      { k: "1", v: "Dedicated vCIO" },
    ],
    sections: [
      { heading: "Technology with a plan", body: "A dedicated vCIO builds a three-year roadmap around where your business is going — so every dollar of IT spend is deliberate." },
      { heading: "No more surprises", body: "Quarterly reviews keep budgets, risk and projects on track, and we manage your vendors so you don't have to." },
    ],
    faqs: [
      { question: "What is a vCIO?", answer: "A virtual Chief Information Officer — a senior technology strategist who plans your roadmap, budget and risk without the cost of a full-time executive." },
      { question: "How often do we meet?", answer: "Quarterly strategy reviews are standard, with a rolling three-year roadmap kept up to date between sessions." },
    ],
  },
];

/* ------------------------------ Testimonials ------------------------------ */
export const testimonials = [
  {
    quote:
      "They migrated our whole practice to the cloud over one weekend — Monday morning, everything just worked. We haven't thought about IT since.",
    name: "Dr. Rachel Nguyen",
    role: "Practice Manager, Meridian Health",
    initials: "DR",
    accentHex: INDIGO,
    tintHex: "rgba(94,91,255,.16)",
  },
  {
    quote:
      "After a near-miss, SyberInfo locked us down properly. MFA, training, monitoring — our cyber insurance premium actually dropped.",
    name: "James Fenwick",
    role: "Director, Northwind Studio",
    initials: "JM",
    accentHex: LIME,
    tintHex: "rgba(201,242,94,.16)",
  },
  {
    quote:
      "We scaled from 8 to 60 people and never hired an IT person. Their helpdesk feels like it's in the next room, not another company.",
    name: "Priya Anand",
    role: "COO, Kestrel SaaS",
    initials: "PA",
    accentHex: INDIGO,
    tintHex: "rgba(94,91,255,.16)",
  },
];

/* -------------------------------- Pricing --------------------------------- */
export type PlanTier = {
  name: string;
  tagline: string;
  price: string;
  unit: string;
  featured?: boolean;
  features: string[];
  cta: string;
  ctaHref: string;
};

export const planTiers: PlanTier[] = [
  {
    name: "Essentials",
    tagline: "For small teams getting their IT organised.",
    price: "$49",
    unit: "/ seat / mo",
    features: [
      "Unlimited helpdesk support",
      "24/7 monitoring & patching",
      "Microsoft 365 management",
      "Endpoint antivirus",
      "Monthly health report",
    ],
    cta: "Start with Essentials",
    ctaHref: "/book",
  },
  {
    name: "Growth",
    tagline: "Proactive management plus real security.",
    price: "$89",
    unit: "/ seat / mo",
    featured: true,
    features: [
      "Everything in Essentials",
      "MFA & phishing simulation",
      "Managed backup & recovery",
      "Cloud & network optimisation",
      "Quarterly strategy review",
      "Priority < 8 min response",
    ],
    cta: "Choose Growth",
    ctaHref: "/book",
  },
  {
    name: "Enterprise",
    tagline: "Compliance, vCIO, and around-the-clock cover.",
    price: "Custom",
    unit: "tailored to you",
    features: [
      "Everything in Growth",
      "Dedicated vCIO & roadmap",
      "Essential Eight compliance",
      "SIEM & 24/7 threat response",
      "On-site support included",
      "Custom SLAs",
    ],
    cta: "Talk to us",
    ctaHref: "/contact",
  },
];

/* ------------------------------ Homepage FAQs ----------------------------- */
export const homeFaqs = [
  { question: "How fast do you respond when something breaks?", answer: "Critical issues get a response in under 8 minutes on average, 24/7. Standard requests are typically actioned within the hour during business hours — all through unlimited helpdesk included in every plan." },
  { question: "Are we locked into a long contract?", answer: "No. All plans are month-to-month with no lock-in. We earn your business every month rather than trapping you in a multi-year agreement." },
  { question: "What does onboarding look like?", answer: "We audit your current environment, document everything, deploy monitoring and security agents, and take over day-to-day support — usually within the first week, at no extra cost." },
  { question: "Do you work with our existing tools?", answer: "Almost certainly. We manage Microsoft 365, Google Workspace, Azure, common line-of-business apps, and a wide range of hardware. If it runs your business, we can support it." },
  { question: "Can you help with compliance and cyber insurance?", answer: "Yes — we align your setup to frameworks like the Essential Eight and help you meet the security controls insurers now require, with reporting you can hand straight to auditors." },
];

/* ----------------------------- Case studies ------------------------------ */
export type CaseSection = { head: string; body: string };
export type CaseStudy = {
  slug: string;
  mark: string;
  gradient: string;
  tags: string[];
  title: string;
  summary: string;
  metrics: { k: string; v: string }[];
  sections: CaseSection[];
  quote: string;
  author: string;
  authorRole: string;
  authorInitials: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "clinic",
    mark: "+",
    gradient: "linear-gradient(135deg,#3F3DCC,#5E5BFF)",
    tags: ["Healthcare", "Cloud Migration"],
    title: "Zero-downtime cloud move for a 40-seat clinic",
    summary:
      "Migrated a multi-site medical practice off ageing on-prem servers to Microsoft 365 and Azure over a single weekend.",
    metrics: [
      { k: "0 hrs", v: "Downtime" },
      { k: "38%", v: "Lower IT spend" },
      { k: "1 wkd", v: "Full cutover" },
    ],
    sections: [
      { head: "THE CHALLENGE", body: "A growing medical practice across three sites was running on five-year-old physical servers. Performance was degrading, the warranty had lapsed, and a hardware failure would have meant days of downtime — unacceptable for patient care and records access." },
      { head: "WHAT WE DID", body: "We designed an Azure-hosted environment and migrated email, files and their practice-management system to Microsoft 365 and Azure VMs. The entire cutover ran across one weekend, with staff trained and tested before Monday's first appointment." },
      { head: "THE OUTCOME", body: "The clinic now runs entirely in the cloud with daily backups, MFA across all accounts, and 38% lower monthly IT costs after retiring the old hardware and consolidating licensing. Staff access records securely from any site." },
    ],
    quote: "We didn't lose a single appointment. Monday morning everything just worked — faster than before.",
    author: "Dr. Helen M.",
    authorRole: "Practice Manager",
    authorInitials: "HM",
  },
  {
    slug: "agency",
    mark: "⚿",
    gradient: "linear-gradient(135deg,#1F8A5B,#C9F25E)",
    tags: ["Creative Agency", "Security"],
    title: "Locking down a fast-growing design studio",
    summary:
      "Rolled out MFA, endpoint protection and staff phishing training after a near-miss turned their biggest risk into a non-issue.",
    metrics: [
      { k: "100%", v: "MFA coverage" },
      { k: "0", v: "Breaches since" },
      { k: "92%", v: "Phishing pass rate" },
    ],
    sections: [
      { head: "THE CHALLENGE", body: "A 25-person creative agency nearly wired funds to a scammer impersonating their director over email. They had no MFA, inconsistent device security, and no staff awareness training. One more click could have been catastrophic." },
      { head: "WHAT WE DID", body: "We deployed MFA across every account, rolled out endpoint detection and response to all devices, and launched a quarterly phishing-simulation and training program. We also tightened email authentication to stop spoofing." },
      { head: "THE OUTCOME", body: "A year on, the agency has had zero security incidents, 100% MFA adoption, and staff now report suspicious emails proactively. Their phishing-test pass rate climbed from 61% to 92%." },
    ],
    quote: "SyberInfo turned the scariest moment of our year into the reason we finally feel safe.",
    author: "Tom R.",
    authorRole: "Creative Director",
    authorInitials: "TR",
  },
  {
    slug: "startup",
    mark: "{}",
    gradient: "linear-gradient(135deg,#5E5BFF,#9D4EDD)",
    tags: ["Startup", "Managed IT"],
    title: "Fully outsourced IT for a scaling SaaS team",
    summary:
      "From 8 to 60 staff in 18 months — we handled onboarding, devices and helpdesk so the founders never touched a support ticket.",
    metrics: [
      { k: "<8 min", v: "Ticket response" },
      { k: "4.9/5", v: "Team rating" },
      { k: "52", v: "Staff onboarded" },
    ],
    sections: [
      { head: "THE CHALLENGE", body: "A venture-backed SaaS startup was scaling fast and their founders were spending hours each week buying laptops, setting up accounts and troubleshooting — time that should have gone into product and customers." },
      { head: "WHAT WE DID", body: "We became their entire IT function: a standardised device fleet, automated onboarding and offboarding, identity and license management, and an unlimited helpdesk. New starters now arrive to a fully configured laptop on day one." },
      { head: "THE OUTCOME", body: "Over 18 months we onboarded 52 new staff with an average helpdesk response under 8 minutes and a 4.9/5 satisfaction rating. The founders haven't touched a support ticket since." },
    ],
    quote: "It feels like we have a 10-person IT team. We have zero — we just have SyberInfo.",
    author: "Aisha K.",
    authorRole: "COO",
    authorInitials: "AK",
  },
];

// Bridge case studies into the existing Project shape for the CMS/work grid.
export const projects: Project[] = caseStudies.map((c, i) => ({
  slug: c.slug,
  title: c.title,
  industry: c.tags[0],
  services: c.tags,
  summary: c.summary,
  results: c.metrics.map((m) => `${m.k} ${m.v}`),
  order: i + 1,
}));

/* --------------------------------- Blog ---------------------------------- */
export type Insight = {
  slug: string;
  category: string;
  date: string;
  readMins: number;
  gradient: string;
  title: string;
  excerpt: string;
  body: string[];
};

export const insights: Insight[] = [
  {
    slug: "essential-eight",
    category: "Security",
    date: "2026-06-12",
    readMins: 5,
    gradient: "linear-gradient(135deg,#3F3DCC,#5E5BFF)",
    title: "The Essential Eight, explained without the jargon",
    excerpt: "What Australia's baseline security framework actually means for your small business.",
    body: [
      "The Essential Eight is a set of eight mitigation strategies from the Australian Cyber Security Centre. For most SMBs it sounds intimidating — but it boils down to common-sense controls.",
      "Start with the basics: multi-factor authentication, regular patching, and restricting admin privileges. These three alone block the majority of common attacks.",
      "You don't need to reach the highest maturity level overnight. We help clients climb the levels at a sensible pace, prioritising the controls that reduce the most risk first.",
    ],
  },
  {
    slug: "cloud-costs",
    category: "Cloud",
    date: "2026-06-03",
    readMins: 4,
    gradient: "linear-gradient(135deg,#1F8A5B,#C9F25E)",
    title: "Five ways your cloud bill is quietly creeping up",
    excerpt: "Idle resources and forgotten licenses add up fast. Here's where to look.",
    body: [
      "Cloud is brilliant until the invoice arrives. The most common culprit is over-provisioned virtual machines — paying for capacity you never use.",
      "Next come orphaned resources: disks, IP addresses and snapshots left behind when something was deleted. They keep billing silently.",
      "A quarterly review of your tenancy usually finds 20–40% in savings. We do this for every managed client automatically.",
    ],
  },
  {
    slug: "remote-work",
    category: "Productivity",
    date: "2026-05-24",
    readMins: 3,
    gradient: "linear-gradient(135deg,#5E5BFF,#9D4EDD)",
    title: "Making hybrid work actually work",
    excerpt: "The tools and policies that keep distributed teams secure and fast.",
    body: [
      "Hybrid work fails when security and convenience pull in opposite directions. The trick is making the secure path the easy path.",
      "Single sign-on with MFA, cloud file storage, and a good VoIP system mean staff get the same experience at home or in the office.",
      "Device management ties it together — so a lost laptop is a minor inconvenience, not a data breach.",
    ],
  },
  {
    slug: "ransomware",
    category: "Security",
    date: "2026-05-15",
    readMins: 6,
    gradient: "linear-gradient(135deg,#CC3D3D,#FF8A5E)",
    title: "What to do in the first hour of a ransomware attack",
    excerpt: "A calm, practical checklist for the moment you hope never comes.",
    body: [
      "The first hour matters most. Isolate affected machines from the network immediately — pull the cable or disable Wi-Fi.",
      "Don't pay, don't panic, and don't wipe anything yet. Preserve evidence and call your IT provider and insurer.",
      "With tested, immutable backups, recovery is a process — not a ransom negotiation. This is exactly why we test restores every month.",
    ],
  },
  {
    slug: "m365-copilot",
    category: "Productivity",
    date: "2026-05-06",
    readMins: 4,
    gradient: "linear-gradient(135deg,#0078D4,#5E5BFF)",
    title: "Is Microsoft 365 Copilot worth it for small teams?",
    excerpt: "An honest look at where the AI assistant saves time — and where it doesn't.",
    body: [
      "Copilot shines at summarising long email threads, drafting documents, and pulling answers out of your own files.",
      "For very small teams the per-seat cost can be hard to justify unless you live in Office apps all day.",
      "Our advice: pilot it with your heaviest document users first, measure the time saved, then decide. We can set up a trial in minutes.",
    ],
  },
  {
    slug: "backups-fail",
    category: "Backup",
    date: "2026-04-28",
    readMins: 3,
    gradient: "linear-gradient(135deg,#1F8A5B,#5E5BFF)",
    title: "Your backups are probably lying to you",
    excerpt: "A backup you've never restored is a hope, not a plan.",
    body: [
      "Most businesses have backups. Far fewer have ever tested restoring from them — and that's where disasters hide.",
      "Backups silently fail: full disks, expired credentials, skipped folders. You only find out when you desperately need them.",
      "We run test restores monthly for every client, so 'we have backups' actually means 'we can recover'.",
    ],
  },
];

// Bridge insights into the existing Post shape for the CMS/blog.
export const posts: Post[] = insights.map((p) => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category,
  author: "SyberInfo",
  date: p.date,
  readMins: p.readMins,
  body: p.body.join("\n\n"),
  status: "published",
}));

/* -------------------------------- Careers -------------------------------- */
export const perks = [
  { icon: "◷", t: "Real balance", d: "No after-hours on-call rotation. We mean it." },
  { icon: "↑", t: "Growth budget", d: "$3k/yr for certs and conferences." },
  { icon: "⌂", t: "Hybrid", d: "Office in the CBD, work from home 3 days." },
  { icon: "♥", t: "Small team", d: "Your work is seen and it matters." },
];

export const roles = [
  { title: "Level 2 Support Engineer", meta: "Full-time · Melbourne / Hybrid · Managed Services" },
  { title: "Cloud & Infrastructure Engineer", meta: "Full-time · Melbourne / Hybrid · Azure & M365" },
  { title: "Cybersecurity Analyst", meta: "Full-time · Melbourne / Hybrid · Security team" },
];

/* --------------------------------- Status -------------------------------- */
export const statusServices = [
  { glyph: "M", name: "Microsoft 365", label: "Operational", uptime: "99.99%" },
  { glyph: "Az", name: "Azure Cloud", label: "Operational", uptime: "100%" },
  { glyph: "☎", name: "VoIP / Phone", label: "Operational", uptime: "99.97%" },
  { glyph: "↺", name: "Backups", label: "Operational", uptime: "99.95%" },
  { glyph: "⌗", name: "Network Monitoring", label: "Operational", uptime: "100%" },
  { glyph: "✆", name: "Helpdesk", label: "Operational", uptime: "99.98%" },
];

export const incidents = [
  { date: "28 Jun 2026", title: "Brief Microsoft 365 sign-in delays", duration: "42 min", body: "A Microsoft-side authentication issue caused slow sign-ins for some users. Resolved upstream by Microsoft; no data affected." },
  { date: "11 Jun 2026", title: "Scheduled VoIP carrier maintenance", duration: "1 hr 05 min", body: "Planned upstream carrier maintenance briefly affected inbound calls overnight. Completed on schedule." },
  { date: "02 Jun 2026", title: "Backup queue processing delay", duration: "2 hr 18 min", body: "A storage node slowdown delayed backup completion. All jobs completed successfully after remediation." },
];

/* ------------------------------- Contact --------------------------------- */
export const contactInfo = [
  { icon: "✉", label: "Email", value: "hello@syberinfo.com.au", href: "mailto:hello@syberinfo.com.au" },
  { icon: "☎", label: "Phone", value: "1300 000 000", href: "tel:+61300000000" },
  { icon: "⌂", label: "Office", value: "Level 8, 120 Collins St, Melbourne", href: "#" },
];

export const contactMethods = [
  { glyph: "✉", label: "EMAIL US", value: "hello@syberinfo.com.au", href: "mailto:hello@syberinfo.com.au" },
  { glyph: "☎", label: "CALL THE HELPDESK", value: "1300 000 000", href: "tel:+61300000000" },
  { glyph: "◈", label: "ALREADY A CLIENT?", value: "Open the client portal", href: "/portal" },
];

/* -------------------------------- Partners ------------------------------- */
export const partners: Partner[] = [
  { name: "Microsoft 365", order: 1 },
  { name: "Azure", order: 2 },
  { name: "Google Workspace", order: 3 },
  { name: "Cloudflare", order: 4 },
  { name: "Fortinet", order: 5 },
  { name: "SentinelOne", order: 6 },
  { name: "Datto", order: 7 },
  { name: "Ubiquiti", order: 8 },
];
