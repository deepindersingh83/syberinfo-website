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
  geo?: { lat: number; lng: number }; // for LocalBusiness schema
  postcode?: string;
  local?: boolean; // true = near our base (prioritised in listings)
};

export const serviceAreas: ServiceArea[] = [
  // --- Our home turf: South East Melbourne (City of Casey & surrounds) ------
  {
    slug: "cranbourne",
    city: "Cranbourne",
    state: "VIC",
    region: "City of Casey, South East Melbourne",
    blurb:
      "Local, on-the-ground IT support for Cranbourne businesses — minutes from our Lyndhurst base, so we're there fast when it matters.",
    landmarks: ["Cranbourne", "Cranbourne North", "Cranbourne West", "Casey Central", "Clyde"],
    geo: { lat: -38.0996, lng: 145.2834 },
    postcode: "3977",
    local: true,
  },
  {
    slug: "dandenong",
    city: "Dandenong",
    state: "VIC",
    region: "Greater Dandenong, South East Melbourne",
    blurb:
      "Managed IT, cybersecurity and support for Dandenong's manufacturers, trades and professional firms across the South East.",
    landmarks: ["Dandenong", "Dandenong South", "Noble Park", "Keysborough", "the industrial precinct"],
    geo: { lat: -37.9874, lng: 145.2149 },
    postcode: "3175",
    local: true,
  },
  {
    slug: "berwick",
    city: "Berwick",
    state: "VIC",
    region: "City of Casey, South East Melbourne",
    blurb:
      "Proactive IT support and security for Berwick's clinics, agencies and growing businesses — local response, enterprise-grade systems.",
    landmarks: ["Berwick", "Beaconsfield", "Officer", "Clyde North", "the Eden Rise precinct"],
    geo: { lat: -38.0333, lng: 145.3453 },
    postcode: "3806",
    local: true,
  },
  {
    slug: "narre-warren",
    city: "Narre Warren",
    state: "VIC",
    region: "City of Casey, South East Melbourne",
    blurb:
      "Fast, friendly managed IT for Narre Warren businesses — cloud, cybersecurity and helpdesk from a team just down the road.",
    landmarks: ["Narre Warren", "Narre Warren North", "Fountain Gate", "Hallam", "Hampton Park"],
    geo: { lat: -38.0262, lng: 145.3033 },
    postcode: "3805",
    local: true,
  },
  {
    slug: "frankston",
    city: "Frankston",
    state: "VIC",
    region: "Frankston & the Mornington Peninsula gateway",
    blurb:
      "Managed IT, cloud and cybersecurity for Frankston's health, trades and professional services — reliable support without the city price tag.",
    landmarks: ["Frankston", "Seaford", "Carrum Downs", "Langwarrin", "the foreshore"],
    geo: { lat: -38.1413, lng: 145.1229 },
    postcode: "3199",
    local: true,
  },
  {
    slug: "pakenham",
    city: "Pakenham",
    state: "VIC",
    region: "Cardinia Shire, South East Melbourne",
    blurb:
      "Local IT support and security for Pakenham and the fast-growing Cardinia corridor — we grow your systems as your business grows.",
    landmarks: ["Pakenham", "Officer", "Beaconsfield", "Nar Nar Goon", "the town centre"],
    geo: { lat: -38.0709, lng: 145.4847 },
    postcode: "3810",
    local: true,
  },
  {
    slug: "mornington",
    city: "Mornington",
    state: "VIC",
    region: "Mornington Peninsula",
    blurb:
      "Managed IT and cybersecurity for Mornington Peninsula businesses — wineries, clinics, hospitality and professional services alike.",
    landmarks: ["Mornington", "Mount Eliza", "Mount Martha", "Hastings", "the Esplanade"],
    geo: { lat: -38.2176, lng: 145.038 },
    postcode: "3931",
    local: true,
  },
  {
    slug: "clayton",
    city: "Clayton",
    state: "VIC",
    region: "Monash, South East Melbourne",
    blurb:
      "Security-led managed IT for Clayton's research, health and tech businesses around the Monash and CSIRO precinct.",
    landmarks: ["Clayton", "Notting Hill", "Mount Waverley", "Monash University", "the tech precinct"],
    geo: { lat: -37.9245, lng: 145.1214 },
    postcode: "3168",
    local: true,
  },
  // --- Wider capital-city reach --------------------------------------------
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
