import { getPayload } from "payload";
import config from "@payload-config";
import { statusServices as fallbackComponents, incidents as fallbackIncidents } from "@/lib/it-data";

/**
 * Live system-status data for the public /status page. Reads the CMS
 * `system-components` and `incidents` collections (managed at /admin) and falls
 * back to the bundled seed data so the page is never blank.
 */

export type ComponentStatus = "operational" | "degraded" | "partial" | "major" | "maintenance";

export type StatusComponent = {
  name: string;
  description: string;
  status: ComponentStatus;
  glyph: string;
};

export type StatusIncident = {
  title: string;
  severity: string;
  status: string;
  startedAt: string;
  resolvedAt: string | null;
  body: string;
  updates: { status: string; body: string; at: string }[];
};

export type SystemStatus = {
  components: StatusComponent[];
  incidents: StatusIncident[];
  overall: "operational" | "degraded" | "down" | "maintenance";
  live: boolean;
};

const s = (v: unknown) => (v == null ? "" : String(v));

const STATUS_LABEL: Record<ComponentStatus, string> = {
  operational: "Operational",
  degraded: "Degraded performance",
  partial: "Partial outage",
  major: "Major outage",
  maintenance: "Maintenance",
};

export function componentLabel(status: ComponentStatus): string {
  return STATUS_LABEL[status] ?? "Operational";
}

function overallFrom(components: StatusComponent[]): SystemStatus["overall"] {
  if (components.some((c) => c.status === "major" || c.status === "partial")) return "down";
  if (components.some((c) => c.status === "degraded")) return "degraded";
  if (components.length && components.every((c) => c.status === "maintenance")) return "maintenance";
  return "operational";
}

export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    const payload = await getPayload({ config });
    const [comps, incs] = await Promise.all([
      payload.find({ collection: "system-components", sort: "order", limit: 100, depth: 0 }),
      payload.find({ collection: "incidents", sort: "-startedAt", limit: 20, depth: 0 }),
    ]);
    if (comps.docs.length || incs.docs.length) {
      const components: StatusComponent[] = (comps.docs as unknown as Record<string, unknown>[]).map((d) => ({
        name: s(d.name),
        description: s(d.description),
        status: (s(d.status) || "operational") as ComponentStatus,
        glyph: s(d.name).slice(0, 2),
      }));
      const incidents: StatusIncident[] = (incs.docs as unknown as Record<string, unknown>[]).map((d) => {
        const updates = Array.isArray(d.updates)
          ? (d.updates as Record<string, unknown>[]).map((u) => ({ status: s(u.status), body: s(u.body), at: s(u.at) }))
          : [];
        return {
          title: s(d.title),
          severity: s(d.severity),
          status: s(d.status),
          startedAt: s(d.startedAt),
          resolvedAt: d.resolvedAt ? s(d.resolvedAt) : null,
          body: updates.length ? updates[updates.length - 1].body : "",
          updates,
        };
      });
      return { components, incidents, overall: overallFrom(components), live: true };
    }
  } catch {
    /* fall through to seed */
  }

  // Seed fallback — all operational.
  const components: StatusComponent[] = fallbackComponents.map((c) => ({
    name: c.name,
    description: `${c.uptime} uptime · 90d`,
    status: "operational",
    glyph: c.glyph,
  }));
  const incidents: StatusIncident[] = fallbackIncidents.map((i) => ({
    title: i.title,
    severity: "minor",
    status: "resolved",
    startedAt: i.date,
    resolvedAt: i.date,
    body: i.body,
    updates: [],
  }));
  return { components, incidents, overall: "operational", live: false };
}
