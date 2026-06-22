export function aud(n?: number): string {
  return `$${(n ?? 0).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function dateAU(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/15 text-green-400",
  paid: "bg-green-500/15 text-green-400",
  pending: "bg-yellow-500/15 text-yellow-400",
  unpaid: "bg-yellow-500/15 text-yellow-400",
  open: "bg-cyan-500/15 text-cyan-300",
  answered: "bg-cyan-500/15 text-cyan-300",
  overdue: "bg-pink-500/15 text-pink-400",
  suspended: "bg-pink-500/15 text-pink-400",
  terminated: "bg-white/10 text-muted",
  cancelled: "bg-white/10 text-muted",
  closed: "bg-white/10 text-muted",
};

export function statusClass(status?: string): string {
  return statusColors[status ?? ""] ?? "bg-white/10 text-muted";
}
