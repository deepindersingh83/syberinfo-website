import { store } from "./site";

export type ServiceSection = { heading: string; body: string };
export type ServiceFaq = { question: string; answer: string };
export type ServicePlan = {
  name: string;
  price?: string; // e.g. "from $990" — leave blank for "Get a quote"
  unit?: string; // e.g. "once-off" or "per month"
  features: string[];
  highlight?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
};

export type ServiceKeyFeature = { title: string; body: string };
export type ServiceMetric = { k: string; v: string };

export type Service = {
  slug: string;
  title: string;
  tagline: string;
  description: string; // short one-liner used on cards
  overview: string; // wide intro shown at the top of the detail page
  icon: string; // emoji glyph kept lightweight (no icon lib dependency)
  features: string[];
  benefits: string[];
  sections: ServiceSection[];
  faqs: ServiceFaq[];
  pricing?: ServicePlan[]; // optional pricing table on the service page
  accent: string; // tailwind gradient stops
  // Optional design fields used by the managed-IT layout
  accentHex?: string; // e.g. "#5E5BFF"
  tintHex?: string; // e.g. "rgba(94,91,255,.14)"
  short?: string; // short label used in tab strips
  lead?: string; // lead paragraph on the detail hero
  keyFeatures?: ServiceKeyFeature[]; // titled feature blocks
  metrics?: ServiceMetric[]; // headline stats (k/v)
};

export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Development",
    tagline: "Fast, scalable, built to convert",
    description:
      "Custom websites and web apps engineered for speed, SEO and conversions — from marketing sites to full e-commerce and customer portals.",
    overview:
      "Your website is the hardest-working member of your team — it sells, supports and builds trust around the clock. At SyberInfo we design and engineer fast, secure, search-friendly websites and web applications that turn visitors into customers. Whether you need a sharp marketing site, a complete online store, a booking platform or a custom internal tool, we build it on modern, future-proof technology that scales with your business.",
    icon: "</>",
    features: [
      "Next.js / React & headless builds",
      "E-commerce & booking systems",
      "WordPress & custom CMS",
      "API & third-party integrations",
    ],
    benefits: [
      "Lightning-fast load times and top Core Web Vitals",
      "Mobile-first, accessible and SEO-ready from day one",
      "Secure, maintainable code you actually own",
      "Built to scale — add features without a rebuild",
    ],
    sections: [
      {
        heading: "Websites that work as hard as you do",
        body: "We start with your goals, not a template. Every page is structured to guide visitors toward a clear action — an enquiry, a booking or a sale. Clean design, fast performance and thoughtful UX come standard, so your site looks the part and performs even better.",
      },
      {
        heading: "E-commerce & web applications",
        body: "Need to sell online or run your business through a custom portal? We build secure stores, membership areas, dashboards and booking systems with payment, inventory and CRM integrations — tailored to how your business actually operates.",
      },
      {
        heading: "Modern, future-proof technology",
        body: "We build with frameworks like Next.js and React, plus headless and traditional CMS options, so your site is fast today and easy to extend tomorrow. You're never locked in, and you always own your code and content.",
      },
    ],
    faqs: [
      {
        question: "How long does a website take to build?",
        answer:
          "A typical marketing website takes 2–4 weeks; larger e-commerce or custom applications take longer. After our first call we'll give you a clear timeline and milestones.",
      },
      {
        question: "Can you redesign or rebuild my existing site?",
        answer:
          "Absolutely. We can refresh your current site or rebuild it on a faster, more secure platform while preserving your SEO and content.",
      },
      {
        question: "Will I be able to update the site myself?",
        answer:
          "Yes. We can set you up with an easy-to-use CMS and a short walkthrough so your team can edit content without touching code.",
      },
    ],
    pricing: [
      {
        name: "Launch",
        price: "from $990",
        unit: "once-off",
        features: ["Up to 5 pages", "Mobile-responsive", "Basic SEO", "Contact form"],
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
      {
        name: "Business",
        price: "from $2,490",
        unit: "once-off",
        features: ["Up to 12 pages", "Easy-to-edit CMS", "Blog & advanced SEO", "Analytics setup"],
        highlight: true,
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
      {
        name: "E-commerce / Custom",
        features: ["Online store or custom build", "Payments & integrations", "Custom features", "Priority support"],
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
    ],
    accent: "from-cyan-glow to-violet-glow",
  },
  {
    slug: "design",
    title: "Design & Branding",
    tagline: "Identities people remember",
    description:
      "UI/UX and brand identity that looks stunning and works flawlessly — wireframes to pixel-perfect, accessible interfaces.",
    overview:
      "Great design is more than good looks — it's how customers understand, trust and choose you. Our design team crafts memorable brand identities and intuitive digital experiences that make your business stand out and feel effortless to use. From your logo and colour palette to every screen and button, we create a cohesive look that builds credibility and drives action.",
    icon: "✦",
    features: [
      "Brand identity & logo design",
      "UI/UX & design systems",
      "Landing page design",
      "Print & social creatives",
    ],
    benefits: [
      "A distinctive brand customers remember",
      "Interfaces that are beautiful and easy to use",
      "Consistent visuals across web, print and social",
      "Reusable design systems that speed up future work",
    ],
    sections: [
      {
        heading: "Brand identity that sticks",
        body: "We shape a visual identity that reflects who you are — logo, colours, typography and tone — and package it into clear brand guidelines so everything you produce looks consistent and professional.",
      },
      {
        heading: "UI/UX that converts",
        body: "We map user journeys, wireframe key flows and design pixel-perfect, accessible interfaces. The result is a site or app that feels intuitive, reduces friction and turns more visitors into customers.",
      },
      {
        heading: "Creative for every channel",
        body: "From landing pages and social media creatives to brochures and ad banners, we keep your brand sharp and recognisable everywhere your customers see you.",
      },
    ],
    faqs: [
      {
        question: "Do you design as well as build?",
        answer:
          "Yes — design and development sit under one roof, so your brand and website stay perfectly aligned and the handover is seamless.",
      },
      {
        question: "Can you refresh our existing brand?",
        answer:
          "We can evolve your current identity or create a brand-new one, depending on your goals and budget.",
      },
      {
        question: "Will I get editable source files?",
        answer:
          "You'll receive your logo and brand assets in all the formats you need, plus guidelines so your brand stays consistent.",
      },
    ],
    pricing: [
      {
        name: "Logo & Brand Basics",
        price: "from $690",
        unit: "once-off",
        features: ["Logo design", "Colour palette & fonts", "2 concepts, 2 revisions"],
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
      {
        name: "Brand Identity",
        price: "from $1,490",
        unit: "once-off",
        features: ["Everything in Basics", "Brand guidelines", "Social & print assets", "Stationery"],
        highlight: true,
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
      {
        name: "Brand + Web Design",
        features: ["Full brand identity", "Website UI/UX design", "Design system", "Ongoing support"],
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
    ],
    accent: "from-violet-glow to-pink-glow",
  },
  {
    slug: "seo",
    title: "SEO",
    tagline: "Rank higher, earn more traffic",
    description:
      "Technical, on-page and content SEO that lifts your rankings and brings qualified organic traffic that actually converts.",
    overview:
      "Showing up on Google is one of the highest-value investments your business can make — and it compounds over time. Our SEO service combines technical fixes, on-page optimisation, content strategy and trusted link building to lift your rankings and bring in qualified visitors who are ready to buy. Everything is measured and reported, so you always see exactly what's working and what it's earning you.",
    icon: "↗",
    features: [
      "Technical SEO audits",
      "Keyword & content strategy",
      "Local SEO & Google Business",
      "Link building & reporting",
    ],
    benefits: [
      "More qualified organic traffic that converts",
      "Higher rankings for the terms that matter",
      "Stronger local visibility on Google Maps",
      "Transparent reporting tied to real results",
    ],
    sections: [
      {
        heading: "Technical foundations",
        body: "We audit your site for the issues that hold rankings back — speed, crawlability, structured data, mobile usability and more — and fix them so search engines can find and reward your pages.",
      },
      {
        heading: "Content & keywords that win",
        body: "We research what your customers actually search for, then map and optimise content to match their intent at every stage — so you attract the right people, not just more clicks.",
      },
      {
        heading: "Local SEO & authority",
        body: "We optimise your Google Business Profile and local listings to win nearby customers, and build trusted links that grow your domain authority and long-term rankings.",
      },
    ],
    faqs: [
      {
        question: "How long until I see SEO results?",
        answer:
          "SEO is a long-term investment. You'll often see early movement in 2–3 months, with momentum building from there. We report progress every month.",
      },
      {
        question: "Do you guarantee #1 rankings?",
        answer:
          "No reputable agency can guarantee a specific position, but we focus on the strategies proven to move rankings and, more importantly, grow leads and sales.",
      },
      {
        question: "Is SEO worth it for a small local business?",
        answer:
          "Definitely — local SEO is one of the most cost-effective ways to win nearby customers actively searching for what you offer.",
      },
    ],
    pricing: [
      {
        name: "Local SEO",
        price: "from $490",
        unit: "per month",
        features: ["Google Business Profile", "On-page optimisation", "Local keywords", "Monthly report"],
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
      {
        name: "Growth SEO",
        price: "from $990",
        unit: "per month",
        features: ["Everything in Local", "Technical SEO", "Content strategy", "Link building"],
        highlight: true,
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
      {
        name: "Performance SEO",
        features: ["Full strategy & roadmap", "Aggressive content & links", "Conversion optimisation", "Dedicated specialist"],
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
    ],
    accent: "from-pink-glow to-cyan-glow",
  },
  {
    slug: "smo",
    title: "Social Media (SMO)",
    tagline: "Build a brand people follow",
    description:
      "Social media optimisation and management that grows your audience and turns followers into customers.",
    overview:
      "Social media is where your audience discovers, follows and recommends brands they love. Our social media optimisation and management service helps you show up consistently with content that builds your audience, sparks engagement and drives real business — not just likes. From optimised profiles and content calendars to community management and paid campaigns, we make your brand impossible to scroll past.",
    icon: "◎",
    features: [
      "Profile & content optimisation",
      "Content calendars & creatives",
      "Community management",
      "Paid social campaigns",
    ],
    benefits: [
      "A growing, engaged and loyal audience",
      "Consistent, on-brand content without the workload",
      "More traffic and leads from social channels",
      "Paid campaigns that maximise every dollar",
    ],
    sections: [
      {
        heading: "Optimised, on-brand profiles",
        body: "We fine-tune your profiles across the platforms that matter so they look professional, rank in social search and clearly tell visitors what you do and why to follow.",
      },
      {
        heading: "Content people actually engage with",
        body: "We plan and produce a steady stream of scroll-stopping posts, reels and graphics mapped to a content calendar — so you stay visible and consistent without the daily scramble.",
      },
      {
        heading: "Community & paid growth",
        body: "We manage comments and messages to build relationships, and run targeted paid campaigns to reach new, relevant audiences and turn engagement into measurable results.",
      },
    ],
    faqs: [
      {
        question: "Which platforms should my business be on?",
        answer:
          "It depends on where your customers spend time. We'll recommend the right mix — often Instagram, Facebook and LinkedIn — rather than spreading you too thin.",
      },
      {
        question: "Do you create the content too?",
        answer:
          "Yes — we handle strategy, copy and creative, and can incorporate your photos, products and brand assets.",
      },
      {
        question: "Can you run our ads as well?",
        answer:
          "We do. We plan, launch and optimise paid social campaigns and report on the leads and sales they generate.",
      },
    ],
    pricing: [
      {
        name: "Essentials",
        price: "from $390",
        unit: "per month",
        features: ["2 platforms", "Content calendar", "8 posts / month", "Monthly report"],
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
      {
        name: "Growth",
        price: "from $790",
        unit: "per month",
        features: ["3 platforms", "Content + creatives", "Community management", "Reels / short video"],
        highlight: true,
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
      {
        name: "Full Service + Ads",
        features: ["All platforms", "Paid social campaigns", "Influencer outreach", "Strategy & reporting"],
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
    ],
    accent: "from-cyan-glow to-pink-glow",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    tagline: "Full-funnel growth engine",
    description:
      "Data-driven campaigns across search, social and email that generate leads and measurable ROI for your business.",
    overview:
      "Digital marketing ties everything together into a single growth engine. We plan and run data-driven campaigns across search, social and email — capturing demand, nurturing leads and converting them into customers. Every campaign is built around clear goals and tracked end-to-end, so you know exactly what's driving results and where every dollar goes.",
    icon: "⚡",
    features: [
      "Google & Meta Ads (PPC)",
      "Email & automation",
      "Conversion rate optimisation",
      "Analytics & growth reporting",
    ],
    benefits: [
      "A predictable, measurable flow of leads",
      "Lower cost per lead through constant optimisation",
      "Campaigns aligned to real revenue goals",
      "Clear reporting on what's working and why",
    ],
    sections: [
      {
        heading: "Paid advertising that pays back",
        body: "We build and manage Google and Meta ad campaigns that put you in front of ready-to-buy customers, then optimise targeting, creative and bids to drive down your cost per lead.",
      },
      {
        heading: "Email & automation",
        body: "We set up email campaigns and automated journeys that nurture leads and bring customers back — turning one-time visitors into repeat business on autopilot.",
      },
      {
        heading: "Optimisation & reporting",
        body: "We continually test landing pages and funnels to lift conversion rates, and give you clear, jargon-free reporting that connects activity to leads, sales and ROI.",
      },
    ],
    faqs: [
      {
        question: "How much should I budget for ads?",
        answer:
          "It varies by industry and goals. We'll recommend a starting budget designed to gather data quickly, then scale what works.",
      },
      {
        question: "Can you work with my existing tools?",
        answer:
          "Yes — we integrate with most popular ad, email, CRM and analytics platforms, or recommend the best fit if you're starting fresh.",
      },
      {
        question: "How do you measure success?",
        answer:
          "By the metrics that matter to you — leads, sales and return on ad spend — not vanity numbers. You'll get regular, transparent reports.",
      },
    ],
    pricing: [
      {
        name: "Starter",
        price: "from $590",
        unit: "per month + ad spend",
        features: ["Google or Meta Ads", "Campaign setup", "Monthly optimisation", "Reporting"],
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
      {
        name: "Growth",
        price: "from $1,190",
        unit: "per month + ad spend",
        features: ["Multi-channel ads", "Email & automation", "Landing pages", "Conversion tracking"],
        highlight: true,
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
      {
        name: "Full Funnel",
        features: ["Search, social & email", "CRO & A/B testing", "Advanced analytics", "Dedicated strategist"],
        ctaLabel: "Get a quote",
        ctaHref: "/contact",
      },
    ],
    accent: "from-violet-glow to-cyan-glow",
  },
];

export type ProductSection = { heading: string; body: string };
export type ProductFaq = { question: string; answer: string };

export type Product = {
  slug: string;
  title: string;
  description: string; // short one-liner used on cards
  overview: string; // wide intro on the detail page
  icon: string;
  href: string; // external order link (hosting portal)
  price?: string;
  highlight?: boolean;
  bullets: string[];
  sections: ProductSection[];
  faqs: ProductFaq[];
};

export const products: Product[] = [
  {
    slug: "domains",
    title: "Domain Names",
    description: "Register the perfect .com.au, .com or any domain in minutes.",
    overview:
      "Your domain is your identity online. Register the perfect .com.au, .com or any of hundreds of extensions in minutes, with free DNS management, easy transfers and optional privacy protection — all managed from one simple dashboard.",
    icon: "🌐",
    href: store.domains,
    price: "from $14.95/yr",
    bullets: ["Free DNS management", "Domain privacy", "Easy transfers"],
    sections: [
      {
        heading: "Find your perfect name",
        body: "Search and register across hundreds of extensions — .com.au, .com, .net, .io and more. Already have a domain elsewhere? Transfer it to us in a few clicks and keep everything in one place.",
      },
      {
        heading: "Full control, included free",
        body: "Every domain comes with an easy DNS manager, email and web forwarding, and optional WHOIS privacy to keep your personal details off public records — at no extra cost.",
      },
    ],
    faqs: [
      {
        question: "Can I transfer my existing domain to SyberInfo?",
        answer:
          "Yes — most domains can be transferred to us quickly, and we'll help you through every step so nothing breaks.",
      },
      {
        question: "Do you offer .com.au domains?",
        answer:
          "Absolutely. We register Australian (.com.au, .net.au) domains as well as all major international extensions.",
      },
    ],
  },
  {
    slug: "web-hosting",
    title: "Web Hosting",
    description: "Blazing-fast, secure hosting with 99.9% uptime and free SSL.",
    overview:
      "Fast, secure and reliable web hosting built for performance. Every plan includes a free SSL certificate, daily backups and an easy cPanel control panel, backed by 99.9% uptime and local support — so your website is always online and protected.",
    icon: "⚡",
    href: store.hosting,
    price: "from $4.95/mo",
    highlight: true,
    bullets: ["Free SSL certificate", "Daily backups", "cPanel control panel"],
    sections: [
      {
        heading: "Speed and uptime you can count on",
        body: "Our hosting runs on high-performance servers with SSD storage and caching for fast load times, backed by a 99.9% uptime guarantee so your visitors never hit a closed door.",
      },
      {
        heading: "Secure and effortless to manage",
        body: "Free SSL keeps your site secure and trusted, automatic daily backups protect your data, and the familiar cPanel interface makes managing email, files and databases simple.",
      },
    ],
    faqs: [
      {
        question: "Can you migrate my existing website?",
        answer:
          "Yes — we can move your existing site and email to our hosting, usually with no downtime.",
      },
      {
        question: "Is SSL really free?",
        answer:
          "It is. Every hosting plan includes a free SSL certificate so your site loads securely over HTTPS.",
      },
    ],
  },
  {
    slug: "linux-hosting",
    title: "Linux Hosting",
    description: "High-performance Linux servers tuned for speed and stability.",
    overview:
      "Rock-solid Linux hosting tuned for speed and stability. With SSD storage, LiteSpeed/Apache and SSH access, it's the ideal home for WordPress, PHP applications and developer projects that need power and flexibility.",
    icon: "🐧",
    href: store.linux,
    price: "from $6.95/mo",
    bullets: ["SSD storage", "LiteSpeed / Apache", "SSH access"],
    sections: [
      {
        heading: "Built for performance",
        body: "Fast SSD storage and an optimised LiteSpeed/Apache stack deliver excellent performance for WordPress and PHP apps, with the stability Linux is famous for.",
      },
      {
        heading: "Developer-friendly",
        body: "Get SSH access, Git, cron jobs and full control over your environment — everything you need to deploy and run modern web applications.",
      },
    ],
    faqs: [
      {
        question: "Is Linux hosting good for WordPress?",
        answer:
          "Yes — Linux hosting is the recommended, best-performing environment for WordPress and most PHP-based websites.",
      },
      {
        question: "Do I get SSH access?",
        answer:
          "Yes, SSH access is included so developers can manage their applications directly.",
      },
    ],
  },
  {
    slug: "google-workspace",
    title: "Google Workspace",
    description: "Professional email, Docs, Drive & Meet on your own domain.",
    overview:
      "Run your business on professional email and Google's productivity suite. Google Workspace gives your team custom @yourdomain email, plus Docs, Sheets, Drive, Meet and Gemini AI — all collaborative, secure and accessible anywhere.",
    icon: "✉️",
    href: store.google,
    price: "from $9.90/user/mo",
    bullets: ["Business email", "30GB+ storage", "Gemini & Meet"],
    sections: [
      {
        heading: "Professional email on your domain",
        body: "Give every team member a polished name@yourdomain.com.au address with the reliability and spam protection of Gmail behind it.",
      },
      {
        heading: "Collaborate from anywhere",
        body: "Docs, Sheets, Slides, Drive storage and Meet video calls keep your team working together in real time, on any device — now supercharged with Gemini AI.",
      },
    ],
    faqs: [
      {
        question: "Can you set it up and migrate our email?",
        answer:
          "Yes — we handle setup and migrate your existing email, contacts and calendars so the switch is smooth.",
      },
      {
        question: "Can I add or remove users later?",
        answer:
          "Of course. You can scale licences up or down at any time as your team changes.",
      },
    ],
  },
  {
    slug: "microsoft-365",
    title: "Microsoft 365",
    description: "Outlook, Teams, Office apps and OneDrive for your team.",
    overview:
      "Everything your team needs to work and collaborate, from Microsoft. Microsoft 365 includes Outlook email on your domain, Teams, the full Office apps and 1TB of OneDrive storage per user — secure, familiar and always up to date.",
    icon: "🪟",
    href: store.microsoft,
    price: "from $9.50/user/mo",
    bullets: ["Outlook email", "Teams & Office", "1TB OneDrive"],
    sections: [
      {
        heading: "Business email with Outlook",
        body: "Professional email on your own domain with the power of Exchange — shared calendars, large mailboxes and enterprise-grade security.",
      },
      {
        heading: "The Office apps your team knows",
        body: "Word, Excel, PowerPoint and Teams, plus 1TB of OneDrive storage per user, so everyone can create, store and collaborate with tools they already understand.",
      },
    ],
    faqs: [
      {
        question: "Which is better — Google Workspace or Microsoft 365?",
        answer:
          "It depends on how your team works. We're happy to advise and can set you up with whichever suits you best.",
      },
      {
        question: "Do you provide setup and support?",
        answer:
          "Yes — we handle provisioning, migration and ongoing support so you're never on your own.",
      },
    ],
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

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string; // ISO date
  readMins: number;
  body: string; // paragraphs separated by blank lines (plain-text fallback)
  richBody?: unknown; // Lexical rich-text JSON from the CMS, when present
  status?: "draft" | "published";
  coverImage?: string; // image URL (from CMS upload)
  authorProfile?: { name: string; role?: string; bio?: string; avatar?: string };
};

export const posts: Post[] = [
  {
    slug: "why-website-speed-matters",
    title: "Why website speed matters (and how to fix a slow site)",
    excerpt:
      "A slow website quietly costs you customers and rankings. Here's why speed matters and the practical steps we use to make sites load in under two seconds.",
    category: "Web Development",
    author: "SyberInfo Team",
    date: "2026-05-12",
    readMins: 5,
    body: `Every second your website takes to load costs you visitors. Studies consistently show that conversion rates drop sharply for each additional second of load time, and Google uses page speed as a ranking signal. In short: a fast site sells more and ranks higher.

The good news is that most speed problems are fixable. The usual culprits are oversized images, bloated themes and plugins, no caching, and slow hosting.

We start every speed project with a measurement — Core Web Vitals and a full performance audit — so we fix what actually matters instead of guessing. From there we optimise images, enable caching and a CDN, trim unused code, and where needed move the site to faster hosting.

The result is a site that feels instant, keeps visitors engaged, and gives search engines another reason to rank you. If your site feels sluggish, get in touch for a free speed check.`,
  },
  {
    slug: "seo-basics-for-small-business",
    title: "SEO basics every small business should get right",
    excerpt:
      "You don't need a huge budget to start ranking. These SEO fundamentals deliver the biggest wins for small and local businesses.",
    category: "SEO",
    author: "SyberInfo Team",
    date: "2026-04-28",
    readMins: 6,
    body: `Search engine optimisation can feel overwhelming, but a handful of fundamentals deliver most of the results for small businesses.

Start with the basics of technical health: a fast, mobile-friendly, secure (HTTPS) website that search engines can easily crawl. If Google can't read your site properly, nothing else matters.

Next, target the right keywords. Think about what your customers actually type when they're ready to buy, and build clear, helpful pages around those terms — one focused page per topic.

Don't overlook local SEO. Claiming and optimising your Google Business Profile, keeping your name, address and phone consistent everywhere, and gathering genuine reviews can put you on the map for nearby searches.

Finally, publish helpful content regularly. Answering your customers' questions builds trust, earns links, and gives you more chances to rank. It compounds over time — which is exactly why SEO is worth starting today.`,
  },
  {
    slug: "google-workspace-vs-microsoft-365",
    title: "Google Workspace vs Microsoft 365: which is right for you?",
    excerpt:
      "Both give your business professional email and productivity tools. Here's a simple way to decide which suits your team.",
    category: "Cloud",
    author: "SyberInfo Team",
    date: "2026-04-10",
    readMins: 4,
    body: `Professional email on your own domain is one of the easiest ways to look credible — and both Google Workspace and Microsoft 365 do it brilliantly. So how do you choose?

Choose Google Workspace if your team values simplicity and real-time collaboration. Gmail, Docs, Sheets and Meet are fast, intuitive and built for working together in the browser, now with Gemini AI built in.

Choose Microsoft 365 if your team relies on the desktop Office apps — Word, Excel, PowerPoint and Outlook — or needs deep integration with Teams and Windows. You also get 1TB of OneDrive storage per user.

In practice, the right answer comes down to how your team already works. As a reseller of both, we're happy to give you honest advice, set everything up, and migrate your existing email with no downtime. Get in touch and we'll point you to the best fit.`,
  },
];

export const PLAN_CATEGORIES = [
  "Google Workspace",
  "Microsoft 365",
  "Website Packages",
  "Marketing & SEO",
] as const;

export type PlanCategory = (typeof PLAN_CATEGORIES)[number];

export type Plan = {
  category: PlanCategory;
  name: string;
  blurb: string;
  priceAnnual?: string; // ex-GST, AUD, billed yearly (e.g. "8.40"). Empty = "Get a quote"
  priceMonthly?: string; // ex-GST, AUD, flexible/no lock-in (indicative)
  unit?: string; // e.g. "per user / month"
  features: string[];
  highlight?: boolean;
  ctaLabel: string;
  ctaHref: string;
  order: number;
};

// Prices in AUD, ex-GST (June 2026). Annual = annual-commit; monthly = flexible
// (indicative ≈ annual ÷ 0.83). All editable in the CMS — update when Microsoft's
// 1 July 2026 AU pricing is published.
export const plans: Plan[] = [
  // ── Google Workspace ──
  {
    category: "Google Workspace",
    name: "Business Starter",
    blurb: "Professional email and the essentials for small teams.",
    priceAnnual: "9.90",
    priceMonthly: "11.90",
    unit: "per user / month",
    features: [
      "Custom business email",
      "30 GB storage per user",
      "Gmail, Docs, Sheets, Slides",
      "Meet video calls (100 participants)",
    ],
    ctaLabel: "Order now",
    ctaHref: store.google,
    order: 1,
  },
  {
    category: "Google Workspace",
    name: "Business Standard",
    blurb: "More storage and bigger meetings for growing teams.",
    priceAnnual: "19.80",
    priceMonthly: "23.80",
    unit: "per user / month",
    features: [
      "Everything in Starter",
      "2 TB storage per user",
      "Meet (150 participants + recording)",
      "Gemini AI assistance",
    ],
    highlight: true,
    ctaLabel: "Order now",
    ctaHref: store.google,
    order: 2,
  },
  {
    category: "Google Workspace",
    name: "Business Plus",
    blurb: "Advanced security and controls for larger teams.",
    priceAnnual: "30.90",
    priceMonthly: "37.00",
    unit: "per user / month",
    features: [
      "Everything in Standard",
      "5 TB storage per user",
      "Meet (500 participants)",
      "Advanced security & eDiscovery (Vault)",
    ],
    ctaLabel: "Order now",
    ctaHref: store.google,
    order: 3,
  },
  // ── Microsoft 365 ──
  {
    category: "Microsoft 365",
    name: "Business Basic",
    blurb: "Web & mobile apps plus business email.",
    priceAnnual: "9.00",
    priceMonthly: "10.80",
    unit: "per user / month",
    features: [
      "Outlook business email",
      "Teams, web & mobile Office apps",
      "1 TB OneDrive storage",
      "SharePoint & Exchange",
    ],
    ctaLabel: "Order now",
    ctaHref: store.microsoft,
    order: 1,
  },
  {
    category: "Microsoft 365",
    name: "Business Standard",
    blurb: "The full desktop Office apps for everyday business.",
    priceAnnual: "18.70",
    priceMonthly: "22.40",
    unit: "per user / month",
    features: [
      "Everything in Basic",
      "Desktop Word, Excel, PowerPoint, Outlook",
      "Teams webinars",
      "1 TB OneDrive storage",
    ],
    highlight: true,
    ctaLabel: "Order now",
    ctaHref: store.microsoft,
    order: 2,
  },
  {
    category: "Microsoft 365",
    name: "Business Premium",
    blurb: "Advanced security and device management.",
    priceAnnual: "32.90",
    priceMonthly: "39.50",
    unit: "per user / month",
    features: [
      "Everything in Standard",
      "Advanced threat protection",
      "Device management (Intune)",
      "Identity & access management",
    ],
    ctaLabel: "Order now",
    ctaHref: store.microsoft,
    order: 3,
  },
  // ── Website Packages (quote-based) ──
  {
    category: "Website Packages",
    name: "Launch",
    blurb: "A polished, fast website to get your business online.",
    features: [
      "Up to 5 pages",
      "Mobile-responsive design",
      "On-page SEO basics",
      "Contact form & Google Maps",
      "SSL & launch support",
    ],
    ctaLabel: "Get a quote",
    ctaHref: "/contact",
    order: 1,
  },
  {
    category: "Website Packages",
    name: "Business",
    blurb: "A bigger site with a CMS so you can edit it yourself.",
    features: [
      "Up to 12 pages",
      "Easy-to-edit CMS",
      "Blog & content setup",
      "Advanced on-page SEO",
      "Analytics & speed optimisation",
    ],
    highlight: true,
    ctaLabel: "Get a quote",
    ctaHref: "/contact",
    order: 2,
  },
  {
    category: "Website Packages",
    name: "E-commerce / Custom",
    blurb: "Online stores and custom web applications.",
    features: [
      "Online store or custom build",
      "Payment & inventory setup",
      "Third-party integrations",
      "Custom features & dashboards",
      "Priority support",
    ],
    ctaLabel: "Get a quote",
    ctaHref: "/contact",
    order: 3,
  },
  // ── Marketing & SEO (quote-based) ──
  {
    category: "Marketing & SEO",
    name: "SEO",
    blurb: "Climb the rankings and win qualified organic traffic.",
    features: [
      "Technical & on-page SEO",
      "Keyword & content strategy",
      "Local SEO & Google Business",
      "Monthly reporting",
    ],
    ctaLabel: "Get a quote",
    ctaHref: "/contact",
    order: 1,
  },
  {
    category: "Marketing & SEO",
    name: "Social Media",
    blurb: "Grow an engaged audience that turns into customers.",
    features: [
      "Profile optimisation",
      "Content calendar & creatives",
      "Community management",
      "Paid social campaigns",
    ],
    highlight: true,
    ctaLabel: "Get a quote",
    ctaHref: "/contact",
    order: 2,
  },
  {
    category: "Marketing & SEO",
    name: "Full-funnel Growth",
    blurb: "End-to-end digital marketing built around ROI.",
    features: [
      "Google & Meta Ads (PPC)",
      "Email & automation",
      "Conversion rate optimisation",
      "Analytics & growth reporting",
    ],
    ctaLabel: "Get a quote",
    ctaHref: "/contact",
    order: 3,
  },
];

export type Partner = { name: string; order: number; logo?: string };

// Technology & platform partners shown in the homepage carousel. Editable in
// the CMS (add a logo image later if desired).
export const partners: Partner[] = [
  { name: "Google Workspace", order: 1 },
  { name: "Microsoft 365", order: 2 },
  { name: "cPanel", order: 3 },
  { name: "LiteSpeed", order: 4 },
  { name: "Cloudflare", order: 5 },
  { name: "Let's Encrypt", order: 6 },
  { name: "WordPress", order: 7 },
  { name: "Stripe", order: 8 },
  { name: "Next.js", order: 9 },
  { name: "Vercel", order: 10 },
];

export type Faq = { question: string; answer: string; category: string; order: number };

// General FAQs shown on the /faq page (and surfaced as FAQ schema for SEO).
export const generalFaqs: Faq[] = [
  {
    category: "General",
    question: "What does SyberInfo do?",
    answer:
      "We're an Australian digital agency offering web development, design, SEO, social media and digital marketing — plus domains, hosting and Google & Microsoft Workspace as a reseller. Everything your business needs to launch and grow online, under one roof.",
    order: 1,
  },
  {
    category: "General",
    question: "Where are you based and who do you work with?",
    answer:
      "We're based in Australia and work with businesses of all sizes across the country, from sole traders and startups to established companies.",
    order: 2,
  },
  {
    category: "Websites",
    question: "How much does a website cost?",
    answer:
      "It depends on the size and features. Our Launch package suits simple sites, while Business and E-commerce builds include a CMS, blog and custom features. Tell us your goals and we'll send a clear, fixed quote.",
    order: 3,
  },
  {
    category: "Websites",
    question: "Can I update the website myself?",
    answer:
      "Yes. We can build your site on an easy-to-use CMS and give you a short walkthrough so your team can edit content without touching code.",
    order: 4,
  },
  {
    category: "Hosting & Email",
    question: "Can you migrate my existing website and email?",
    answer:
      "Absolutely. We handle migrations of websites, email and domains — usually with no downtime — and manage the whole process for you.",
    order: 5,
  },
  {
    category: "Hosting & Email",
    question: "Should I choose Google Workspace or Microsoft 365?",
    answer:
      "Both are excellent. Google Workspace shines for simple, real-time collaboration; Microsoft 365 suits teams that rely on desktop Office apps and Teams. As a reseller of both, we'll recommend the right fit and set it up for you.",
    order: 6,
  },
  {
    category: "Working with us",
    question: "How do we get started?",
    answer:
      "Get in touch via our contact form or email. We'll have a quick chat about your goals, then send a tailored proposal and quote — usually within one business day.",
    order: 7,
  },
];

export type HelpArticle = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string; // paragraphs separated by blank lines
  order: number;
};

// Knowledge Base / Help Centre articles. Editable in the CMS.
export const helpArticles: HelpArticle[] = [
  {
    slug: "point-domain-to-our-hosting",
    title: "How to point your domain to our hosting",
    category: "Domains & DNS",
    excerpt: "Update your nameservers or A record so your domain loads your website on our hosting.",
    order: 1,
    body: `If you registered your domain with us, this is already done for you. If your domain is elsewhere, you have two options.

Option 1 — Nameservers: Log in to your domain registrar and set the nameservers we provided (they look like ns1.syberinfo.com / ns2.syberinfo.com). This hands DNS management to us.

Option 2 — A record: If you want to keep DNS where it is, create an A record pointing to the server IP we gave you, and a CNAME for www.

DNS changes can take up to 24–48 hours to propagate worldwide, though they're often much faster. Still stuck? Contact us and we'll do it for you.`,
  },
  {
    slug: "set-up-business-email",
    title: "Setting up your business email",
    category: "Email",
    excerpt: "Get your name@yourdomain email working on your phone and computer.",
    order: 2,
    body: `Once your Google Workspace or Microsoft 365 mailbox is active, you can add it to any device.

On your phone: open your mail app, choose "Add account", pick Google or Exchange/Microsoft, and sign in with your full email address and password.

On a computer: use the Gmail/Outlook web app, or add the account to Outlook or Apple Mail using the same details.

If you're migrating from an old provider, we can move your existing emails, contacts and calendars across — usually with no downtime. Just ask.`,
  },
  {
    slug: "install-ssl-certificate",
    title: "Why my site shows 'Not secure' and how to fix it",
    category: "Hosting",
    excerpt: "Enable the free SSL certificate so your site loads securely over HTTPS.",
    order: 3,
    body: `A "Not secure" warning means your site is loading over HTTP without an SSL certificate.

Every hosting plan with us includes a free SSL certificate. In most cases it's installed automatically. If you still see the warning, it usually means the certificate needs to be activated or the site needs to be forced to HTTPS.

Let us know your domain and we'll enable SSL and set up an automatic HTTP-to-HTTPS redirect so every visitor gets the secure version.`,
  },
  {
    slug: "access-client-portal",
    title: "Accessing your client portal & invoices",
    category: "Billing",
    excerpt: "Manage your services, renewals and invoices in one place.",
    order: 4,
    body: `Your domains, hosting and email subscriptions are managed in our client portal at hosting.syberinfo.com.au.

From there you can view active services, download tax invoices, update payment details and renew or upgrade plans.

Forgot your password? Use the "Forgot password" link on the login page, or contact us and we'll help you back in.`,
  },
  {
    slug: "set-up-multi-factor-authentication",
    title: "How to set up multi-factor authentication",
    category: "Security",
    excerpt: "Add a second layer of protection to your Microsoft 365 or Google account in under five minutes.",
    order: 5,
    body: `Multi-factor authentication (MFA) requires a second proof of identity — usually a code from your phone — on top of your password.

Open your account security settings, choose "Add sign-in method", and select an authenticator app. Scan the QR code with Microsoft Authenticator or Google Authenticator.

Confirm the 6-digit code, save your backup codes somewhere safe, and you're done. Contact the helpdesk if you lose access to your device.`,
  },
  {
    slug: "recover-a-deleted-email-or-file",
    title: "Recovering a deleted email or file",
    category: "Email",
    excerpt: "Restore items from the recycle bin or request a point-in-time recovery from backup.",
    order: 6,
    body: `Most deletions can be undone from the Deleted Items folder (email) or the Recycle Bin (OneDrive/SharePoint) within 30 days.

For older items, raise a ticket and we can restore from your daily backup — typically within an hour.`,
  },
  {
    slug: "onboarding-a-new-staff-member",
    title: "Onboarding a new staff member",
    category: "Devices",
    excerpt: "The checklist we follow to get a new starter fully equipped on day one.",
    order: 7,
    body: `Submit a ticket at least five business days before the start date with the role, required software, and start date.

We provision the laptop, create accounts, assign licenses, and configure security policies before dispatch.`,
  },
  {
    slug: "connect-to-the-company-vpn",
    title: "Connecting to the company VPN",
    category: "Networking",
    excerpt: "Step-by-step guide to secure remote access from any device.",
    order: 8,
    body: `Install the VPN client we provided, enter your work email, and approve the MFA prompt.

Once connected you'll have secure access to internal file shares and applications.`,
  },
  {
    slug: "spotting-a-phishing-email",
    title: "Spotting a phishing email",
    category: "Security",
    excerpt: "The red flags every staff member should know.",
    order: 9,
    body: `Check the sender address carefully, hover over links before clicking, and be wary of urgent requests for money or credentials.

When in doubt, forward the email to security@syberinfo.com.au and we'll verify it.`,
  },
  {
    slug: "understanding-your-monthly-invoice",
    title: "Understanding your monthly invoice",
    category: "Billing",
    excerpt: "What each line item means and how seat-based billing works.",
    order: 10,
    body: `Your invoice covers your managed plan plus any add-on services and per-seat software licenses active that month.

Changes mid-month are prorated and appear on the following invoice.`,
  },
];

export type Project = {
  slug: string;
  title: string;
  industry: string;
  services: string[];
  summary: string;
  beforeImage?: string;
  afterImage?: string;
  url?: string;
  results: string[];
  order: number;
};

// Portfolio / case studies. Replace placeholder before/after images in the CMS.
export const projects: Project[] = [
  {
    slug: "retail-co-rebuild",
    title: "Retail Co. — website rebuild & SEO",
    industry: "Retail",
    services: ["Web Development", "SEO"],
    summary:
      "A tired, slow website rebuilt into a fast, modern store that ranks and converts.",
    results: ["2× online enquiries", "68% faster load time", "Page 1 for key terms"],
    order: 1,
  },
  {
    slug: "trades-group-site",
    title: "Trades Group — lead-generating site",
    industry: "Trades & Construction",
    services: ["Web Development", "Design & Branding"],
    summary:
      "A clean, mobile-first site with clear calls to action that turns visitors into quote requests.",
    results: ["+140% quote requests", "Mobile-first redesign", "Booking form integrated"],
    order: 2,
  },
  {
    slug: "services-firm-marketing",
    title: "Services Firm — digital marketing",
    industry: "Professional Services",
    services: ["Digital Marketing", "SEO"],
    summary:
      "A full-funnel campaign across search and social delivering a steady flow of qualified leads.",
    results: ["3.4× return on ad spend", "Cost per lead down 40%", "Clear monthly reporting"],
    order: 3,
  },
  {
    slug: "hospitality-brand",
    title: "Hospitality Brand — identity & web",
    industry: "Hospitality",
    services: ["Design & Branding", "Web Development"],
    summary:
      "A memorable brand identity paired with a beautiful, bookings-ready website.",
    results: ["New brand identity", "Online bookings live", "+55% direct bookings"],
    order: 4,
  },
];
