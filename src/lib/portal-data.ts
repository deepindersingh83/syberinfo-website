/* ============================================================================
   Client portal demo data (SyberInfo Portal design).
   The portal runs as a client-side experience with a localStorage session and
   this representative data — mirrors the imported design.
========================================================================== */

export const authStats = [
  { k: "99.98%", v: "Monitored uptime" },
  { k: "<8 min", v: "Avg ticket reply" },
  { k: "24/7", v: "Security desk" },
];

export const baseServices = [
  { icon: "☁", name: "Managed IT & Support", tier: "Professional · 42 seats", price: "$1,890", renew: "Renews 1 Jul 2026", status: "Active", statusColor: "#c9f25e", statusTint: "rgba(201,242,94,.12)" },
  { icon: "⚿", name: "Cybersecurity Suite", tier: "Advanced · MFA + EDR", price: "$420", renew: "Renews 1 Jul 2026", status: "Active", statusColor: "#c9f25e", statusTint: "rgba(201,242,94,.12)" },
  { icon: "↺", name: "Backup & Recovery", tier: "Daily · 2TB retained", price: "$170", renew: "Renews 1 Jul 2026", status: "Active", statusColor: "#c9f25e", statusTint: "rgba(201,242,94,.12)" },
  { icon: "⊞", name: "Cloud VoIP", tier: "12 lines · AU numbers", price: "$0", renew: "Trial ends 30 Jun", status: "Trial", statusColor: "#ffb570", statusTint: "rgba(255,170,90,.14)" },
];

export const addonCatalog = [
  { id: "soc", icon: "◎", name: "24/7 SOC Monitoring", desc: "Round-the-clock threat detection & response.", price: "$390 / month" },
  { id: "vcio", icon: "✦", name: "vCIO Strategy", desc: "Quarterly roadmap & budget planning sessions.", price: "$650 / month" },
  { id: "phish", icon: "✉", name: "Phishing Simulation", desc: "Automated staff training & test campaigns.", price: "$120 / month" },
  { id: "compliance", icon: "⛨", name: "Compliance Pack", desc: "Essential Eight & ISO 27001 reporting.", price: "$280 / month" },
];

export const planTiersPortal = [
  { name: "ESSENTIAL", price: "$990", per: "/ mo", tagline: "Core managed IT for small teams up to 15 seats.", features: ["Helpdesk 8am–6pm", "Patch management", "Endpoint antivirus", "Monthly reporting"], popular: false },
  { name: "PROFESSIONAL", price: "$1,890", per: "/ mo", tagline: "Proactive IT + security for growing businesses.", features: ["Everything in Essential", "24/7 monitoring", "MFA + EDR security", "Backup & recovery", "Dedicated engineer"], popular: true },
  { name: "ENTERPRISE", price: "Custom", per: "", tagline: "Full-stack IT with strategy and compliance.", features: ["Everything in Professional", "vCIO strategy", "SOC monitoring", "Compliance reporting", "Priority SLAs"], popular: false },
];

export type SoftwarePlan = { id: string; name: string; priceNum: number; feat: string };
export type SoftwareAddon = { id: string; name: string; priceNum: number; desc: string };
export type Software = {
  id: string;
  name: string;
  brand: string;
  category: string;
  letter: string;
  color: string;
  tagline: string;
  plans: SoftwarePlan[];
  addons: SoftwareAddon[];
};

export const software: Software[] = [
  {
    id: "google", name: "Google Workspace", brand: "Google", category: "Productivity", letter: "G", color: "#4285F4", tagline: "Gmail, Drive, Docs, Meet & Calendar for business.",
    plans: [
      { id: "g-starter", name: "Business Starter", priceNum: 8.4, feat: "30 GB / user · Meet 100 participants" },
      { id: "g-standard", name: "Business Standard", priceNum: 16.8, feat: "2 TB / user · Meet 150 + recording" },
      { id: "g-plus", name: "Business Plus", priceNum: 25.2, feat: "5 TB / user · Vault + advanced security" },
    ],
    addons: [
      { id: "g-voice", name: "Google Voice", priceNum: 14, desc: "Cloud telephony with AU numbers." },
      { id: "g-vault", name: "Vault eDiscovery", priceNum: 6, desc: "Retention & legal hold." },
    ],
  },
  {
    id: "microsoft", name: "Microsoft 365", brand: "Microsoft", category: "Productivity", letter: "M", color: "#0078D4", tagline: "Outlook, Teams, OneDrive & the Office apps.",
    plans: [
      { id: "m-basic", name: "Business Basic", priceNum: 8.2, feat: "Web + mobile apps · Teams · 1 TB" },
      { id: "m-standard", name: "Business Standard", priceNum: 17.2, feat: "Desktop apps · webinars · bookings" },
      { id: "m-premium", name: "Business Premium", priceNum: 30.2, feat: "Advanced security + device management" },
    ],
    addons: [
      { id: "m-phone", name: "Teams Phone", priceNum: 11, desc: "PSTN calling plan." },
      { id: "m-copilot", name: "Copilot for M365", priceNum: 41, desc: "AI across the Office apps." },
    ],
  },
  {
    id: "adobe", name: "Adobe Creative Cloud", brand: "Adobe", category: "Creative", letter: "A", color: "#FA0F00", tagline: "Photoshop, Illustrator, Premiere & more.",
    plans: [
      { id: "a-single", name: "Single App", priceNum: 29.99, feat: "One CC app of your choice" },
      { id: "a-all", name: "All Apps", priceNum: 89.99, feat: "20+ apps · 100 GB cloud storage" },
    ],
    addons: [{ id: "a-stock", name: "Adobe Stock", priceNum: 33.99, desc: "10 assets / month." }],
  },
  {
    id: "zoom", name: "Zoom Workplace", brand: "Zoom", category: "Communication", letter: "Z", color: "#2D8CFF", tagline: "Meetings, phone, team chat & whiteboard.",
    plans: [
      { id: "z-pro", name: "Pro", priceNum: 18.99, feat: "Up to 100 · 30-hour meetings" },
      { id: "z-biz", name: "Business", priceNum: 24.99, feat: "Up to 300 · branding + transcripts" },
    ],
    addons: [{ id: "z-large", name: "Large Meeting", priceNum: 79, desc: "Up to 1,000 participants." }],
  },
  {
    id: "atlassian", name: "Jira & Confluence", brand: "Atlassian", category: "Dev Tools", letter: "J", color: "#2684FF", tagline: "Issue tracking & team knowledge base.",
    plans: [
      { id: "at-std", name: "Standard", priceNum: 8.15, feat: "Up to 50k users · 250 GB" },
      { id: "at-prem", name: "Premium", priceNum: 16, feat: "Advanced roadmaps · 99.9% SLA" },
    ],
    addons: [{ id: "at-bamboo", name: "Bitbucket", priceNum: 3.3, desc: "Git repos & pipelines." }],
  },
  {
    id: "dropbox", name: "Dropbox Business", brand: "Dropbox", category: "Storage", letter: "D", color: "#0061FF", tagline: "Secure file storage, sync & sharing.",
    plans: [
      { id: "d-std", name: "Standard", priceNum: 18, feat: "5 TB shared storage" },
      { id: "d-adv", name: "Advanced", priceNum: 30, feat: "As much space as needed + admin" },
    ],
    addons: [{ id: "d-sign", name: "Dropbox Sign", priceNum: 20, desc: "eSignatures." }],
  },
  {
    id: "canva", name: "Canva Teams", brand: "Canva", category: "Creative", letter: "C", color: "#00C4CC", tagline: "Brand kits, templates & collaborative design.",
    plans: [{ id: "c-teams", name: "Teams", priceNum: 13, feat: "Brand kit · 1,000+ templates" }],
    addons: [],
  },
];

export type Ticket = {
  id: string;
  title: string;
  category: string;
  priority: string;
  opened: string;
  updated: string;
  status: string;
  sc: "open" | "wait" | "done";
  timeline: { label: string; time: string; done: boolean }[];
  thread: { who: string; role: string; time: string; msg: string; you?: boolean }[];
};

export const allTickets: Ticket[] = [
  {
    id: "#4821", title: "Outlook not syncing on reception PC", category: "Email & M365", priority: "High", opened: "17 Jun 2026, 9:04am", updated: "2h ago", status: "In progress", sc: "open",
    timeline: [{ label: "Ticket raised", time: "9:04am", done: true }, { label: "Engineer assigned — Priya", time: "9:18am", done: true }, { label: "Diagnosis in progress", time: "11:30am", done: true }, { label: "Resolution", time: "Pending", done: false }],
    thread: [{ who: "You", role: "Client", time: "9:04am", msg: "Reception PC won’t sync new mail since this morning. Restarted already.", you: true }, { who: "Priya N.", role: "L2 Engineer", time: "9:22am", msg: "Thanks — I can see the OST is locked. Re-creating the profile remotely now, give me ~15 min." }],
  },
  {
    id: "#4818", title: "New starter laptop provisioning", category: "Devices", priority: "Normal", opened: "16 Jun 2026", updated: "Yesterday", status: "Scheduled", sc: "done",
    timeline: [{ label: "Request received", time: "Mon", done: true }, { label: "Hardware ordered", time: "Mon", done: true }, { label: "Imaging & setup", time: "Thu", done: false }, { label: "Dispatch", time: "Fri", done: false }],
    thread: [{ who: "You", role: "Client", time: "Mon", msg: "New marketing hire starts next Monday — need a standard laptop.", you: true }, { who: "Marco T.", role: "Coordinator", time: "Mon", msg: "Ordered a Latitude 5450. Will be imaged and shipped Thursday." }],
  },
  {
    id: "#4810", title: "VPN access for remote contractor", category: "Networking", priority: "Normal", opened: "14 Jun 2026", updated: "3d ago", status: "Awaiting you", sc: "wait",
    timeline: [{ label: "Request received", time: "Sat", done: true }, { label: "Awaiting contractor details", time: "Sat", done: false }],
    thread: [{ who: "Sam K.", role: "Security", time: "Sat", msg: "Happy to set this up — can you confirm the contractor’s full name and end date?" }],
  },
  {
    id: "#4802", title: "Quarterly security review", category: "Security", priority: "Low", opened: "12 Jun 2026", updated: "5d ago", status: "In progress", sc: "open",
    timeline: [{ label: "Review scheduled", time: "Wed", done: true }, { label: "Data collection", time: "In progress", done: false }],
    thread: [{ who: "Priya N.", role: "L2 Engineer", time: "Wed", msg: "Kicking off your Q2 review — I’ll share the report by end of week." }],
  },
];

export const invoices = [
  { id: "INV-2026-06", date: "01 Jun 2026", period: "Managed IT — Professional (June 2026)", amount: "$2,480", status: "Paid", sc: "done" as const },
  { id: "INV-2026-05", date: "01 May 2026", period: "Managed IT — Professional (May 2026)", amount: "$2,480", status: "Paid", sc: "done" as const },
  { id: "INV-2026-07", date: "01 Jul 2026", period: "Managed IT — Professional (July 2026)", amount: "$2,480", status: "Due 01 Jul", sc: "wait" as const },
  { id: "INV-2026-04", date: "01 Apr 2026", period: "Managed IT — Professional (April 2026)", amount: "$2,310", status: "Paid", sc: "done" as const },
  { id: "INV-2026-03", date: "01 Mar 2026", period: "Onboarding & setup", amount: "$1,500", status: "Paid", sc: "done" as const },
];

export const kbArticles = [
  { id: "k1", cat: "Security", title: "How to set up multi-factor authentication", excerpt: "Add a second layer of protection to your Microsoft 365 or Google account in under five minutes.", read: "4 min", body: ["Multi-factor authentication (MFA) requires a second proof of identity — usually a code from your phone — on top of your password.", "Open your account security settings, choose \"Add sign-in method\", and select an authenticator app. Scan the QR code with Microsoft Authenticator or Google Authenticator.", "Confirm the 6-digit code, save your backup codes somewhere safe, and you’re done. Contact the helpdesk if you lose access to your device."] },
  { id: "k2", cat: "Email", title: "Recovering a deleted email or file", excerpt: "Restore items from the recycle bin or request a point-in-time recovery from backup.", read: "3 min", body: ["Most deletions can be undone from the Deleted Items folder (email) or the Recycle Bin (OneDrive/SharePoint) within 30 days.", "For older items, raise a ticket and we can restore from your daily backup — typically within an hour."] },
  { id: "k3", cat: "Devices", title: "Onboarding a new staff member", excerpt: "The checklist we follow to get a new starter fully equipped on day one.", read: "5 min", body: ["Submit a ticket at least five business days before the start date with the role, required software, and start date.", "We provision the laptop, create accounts, assign licenses, and configure security policies before dispatch."] },
  { id: "k4", cat: "Networking", title: "Connecting to the company VPN", excerpt: "Step-by-step guide to secure remote access from any device.", read: "4 min", body: ["Install the VPN client we provided, enter your work email, and approve the MFA prompt.", "Once connected you’ll have secure access to internal file shares and applications."] },
  { id: "k5", cat: "Security", title: "Spotting a phishing email", excerpt: "The five red flags every staff member should know.", read: "3 min", body: ["Check the sender address carefully, hover over links before clicking, and be wary of urgent requests for money or credentials.", "When in doubt, forward the email to security@syberinfo.com.au and we’ll verify it."] },
  { id: "k6", cat: "Billing", title: "Understanding your monthly invoice", excerpt: "What each line item means and how seat-based billing works.", read: "2 min", body: ["Your invoice covers your managed plan plus any add-on services and per-seat software licenses active that month.", "Changes mid-month are prorated and appear on the following invoice."] },
];

export const notifications = [
  { icon: "⚙", color: "#ffb570", title: "Scheduled maintenance — Azure VMs", meta: "Sat 28 Jun, 11pm–1am AEST · brief reboot expected" },
  { icon: "✉", color: "#9d9bff", title: "Ticket #4821 updated by Priya N.", meta: "2 hours ago · Diagnosis in progress" },
  { icon: "⛨", color: "#c9f25e", title: "Quarterly security review complete", meta: "Yesterday · No critical findings" },
  { icon: "$", color: "#9d9bff", title: "Invoice INV-2026-06 paid", meta: "1 Jun · $2,480 via Visa •••• 4291" },
];

export const paymentMethods = [
  { brand: "VISA", number: "•••• •••• •••• 4291", exp: "08 / 27", isDefault: true, gradient: "linear-gradient(135deg,#3F3DCC,#5E5BFF)" },
  { brand: "MASTERCARD", number: "•••• •••• •••• 7720", exp: "03 / 26", isDefault: false, gradient: "linear-gradient(135deg,#1A1E27,#2A2F3C)" },
];

export const billingHistory = [
  { date: "01 Jun 26", desc: "Managed IT — Professional (June)", status: "Paid", amount: "$2,480" },
  { date: "01 May 26", desc: "Managed IT — Professional (May)", status: "Paid", amount: "$2,480" },
  { date: "01 Apr 26", desc: "Managed IT — Professional (April)", status: "Paid", amount: "$2,310" },
  { date: "01 Mar 26", desc: "Onboarding & setup", status: "Paid", amount: "$1,500" },
];

export const statusTint = { open: "rgba(94,91,255,.16)", wait: "rgba(255,170,90,.14)", done: "rgba(201,242,94,.12)" };
export const statusColor = { open: "#9d9bff", wait: "#ffb570", done: "#c9f25e" };

export const navTabs = [
  { key: "overview", label: "Overview", icon: "▦" },
  { key: "services", label: "My services", icon: "☰" },
  { key: "plans", label: "Browse plans", icon: "◆" },
  { key: "software", label: "Software", icon: "▧" },
  { key: "tickets", label: "Tickets", icon: "✉", badge: 4 },
  { key: "invoices", label: "Invoices", icon: "$" },
  { key: "knowledge", label: "Knowledge base", icon: "?" },
  { key: "payments", label: "Payments", icon: "▭" },
  { key: "settings", label: "Settings", icon: "⚙" },
] as const;
