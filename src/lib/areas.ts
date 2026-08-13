/**
 * Service areas for programmatic local-SEO landing pages (/managed-it/{slug}).
 * Curated (not auto-exploded into hundreds of thin pages) so each page carries
 * genuine, differentiated local content — the way Google wants local pages done.
 */

export type ServiceArea = {
  slug: string;
  city: string; // display name
  state: string;
  region: string; // broader area for context
  blurb: string; // one differentiated sentence
  landmarks: string[]; // local colour woven into copy
};

export const serviceAreas: ServiceArea[] = [
  {
    slug: "melbourne",
    city: "Melbourne",
    state: "VIC",
    region: "Greater Melbourne",
    blurb:
      "From Collins Street towers to Cremorne startups, we keep Melbourne businesses running with local, on-the-ground managed IT.",
    landmarks: ["the CBD", "Cremorne", "Richmond", "South Melbourne", "Docklands"],
  },
  {
    slug: "sydney",
    city: "Sydney",
    state: "NSW",
    region: "Greater Sydney",
    blurb:
      "Managed IT, cloud and cybersecurity for Sydney firms — from the CBD to the North Shore and the tech corridor around Macquarie Park.",
    landmarks: ["the CBD", "North Sydney", "Parramatta", "Macquarie Park", "Surry Hills"],
  },
  {
    slug: "brisbane",
    city: "Brisbane",
    state: "QLD",
    region: "South East Queensland",
    blurb:
      "Responsive IT support and security for Brisbane and the South East Queensland growth belt.",
    landmarks: ["the CBD", "Fortitude Valley", "Milton", "South Brisbane", "Newstead"],
  },
  {
    slug: "geelong",
    city: "Geelong",
    state: "VIC",
    region: "Greater Geelong",
    blurb:
      "Enterprise-grade managed IT for Geelong's manufacturers, health and professional services — without the big-smoke price tag.",
    landmarks: ["central Geelong", "Newtown", "Waurn Ponds", "the waterfront"],
  },
  {
    slug: "perth",
    city: "Perth",
    state: "WA",
    region: "Greater Perth",
    blurb:
      "Cybersecurity-led managed IT for Perth's resources, engineering and professional firms across every timezone.",
    landmarks: ["the CBD", "West Perth", "Osborne Park", "Fremantle"],
  },
  {
    slug: "adelaide",
    city: "Adelaide",
    state: "SA",
    region: "Greater Adelaide",
    blurb:
      "Managed IT, cloud and Essential Eight uplift for Adelaide's defence, health and services sector.",
    landmarks: ["the CBD", "North Adelaide", "Norwood", "Mawson Lakes"],
  },
];

export const getArea = (slug: string) => serviceAreas.find((a) => a.slug === slug) ?? null;
