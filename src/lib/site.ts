/**
 * Central place for brand info, navigation and external links.
 * Update these once and they propagate across the whole site.
 */
export const site = {
  name: "SyberInfo",
  legalName: "SyberInfo",
  domain: "syberinfo.com",
  url: "https://syberinfo.com",
  tagline: "Web. Design. Growth.",
  description:
    "SyberInfo builds high-performing websites and digital marketing that grow Australian businesses — web development, design, SEO, SMO, plus domains, hosting and Google & Microsoft Workspace as a trusted reseller.",
  email: "admin@syberinfo.com.au",
  phone: "+61 0000 000 000",
  location: "Australia",
  // Existing billing / client portal (WHMCS-style) lives on this subdomain
  storeUrl: "https://hosting.syberinfo.com.au",
  social: {
    facebook: "https://facebook.com/syberinfo",
    instagram: "https://instagram.com/syberinfo",
    linkedin: "https://linkedin.com/company/syberinfo",
    twitter: "https://twitter.com/syberinfo",
  },
} as const;

export const nav = [
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** Quick links into the existing hosting/store platform. */
export const store = {
  domains: `${site.storeUrl}/cart.php?a=add&domain=register`,
  hosting: `${site.storeUrl}/index.php?rp=/store/web-hosting`,
  linux: `${site.storeUrl}/index.php?rp=/store/linux-hosting`,
  google: `${site.storeUrl}/index.php?rp=/store/google-workspace`,
  microsoft: `${site.storeUrl}/index.php?rp=/store/microsoft-365`,
  login: site.storeUrl,
} as const;
