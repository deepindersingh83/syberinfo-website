import { site } from "@/lib/site";
import { getServices } from "@/lib/content";
import { serviceAreas } from "@/lib/areas";

export const dynamic = "force-dynamic";

/**
 * llms.txt — a concise, machine-readable summary for AI answer engines
 * (ChatGPT, Perplexity, Google AI Overviews, Claude). Emerging convention that
 * helps LLMs cite the business accurately. Served at /llms.txt.
 */
export async function GET() {
  const services = await getServices();
  const L = site.local;
  const localAreas = serviceAreas.filter((a) => a.local).map((a) => a.city);

  const body = `# ${site.name}

> ${site.description}

- Name: ${site.name}
- Website: ${site.url}
- Phone: ${site.phoneIntl}
- Email: ${site.email}
- Location: ${L.suburb}, ${L.stateFull} ${L.postcode}, Australia
- Hours: ${L.hoursHuman}
- Serves: ${L.region} and greater Melbourne — including ${localAreas.join(", ")}

## Services
${services.map((s) => `- [${s.title}](${site.url}/services/${s.slug}): ${s.description}`).join("\n")}

## Key pages
- [Services](${site.url}/services)
- [Pricing](${site.url}/pricing)
- [Case studies](${site.url}/work)
- [Client reviews](${site.url}/reviews)
- [Insights / blog](${site.url}/blog)
- [Help centre](${site.url}/help)
- [Essential Eight check](${site.url}/essential-eight)
- [Contact](${site.url}/contact)

## Local service areas
${serviceAreas.map((a) => `- [Managed IT ${a.city}](${site.url}/managed-it/${a.slug})`).join("\n")}

## Contact
For quotes or support, call ${site.phoneIntl}, email ${site.email}, or visit ${site.url}/contact.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
