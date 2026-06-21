/** Static feature matrix comparing Google Workspace and Microsoft 365. */
const rows: { feature: string; google: string; microsoft: string }[] = [
  { feature: "Business email on your domain", google: "Gmail", microsoft: "Outlook / Exchange" },
  { feature: "Starting price (per user/mo, ex-GST)", google: "$8.40", microsoft: "$9.00" },
  { feature: "Cloud storage (entry plan)", google: "30 GB", microsoft: "1 TB OneDrive" },
  { feature: "Desktop Office apps", google: "Web-based (Docs/Sheets)", microsoft: "Yes (from Standard)" },
  { feature: "Video meetings", google: "Google Meet", microsoft: "Microsoft Teams" },
  { feature: "Built-in AI assistant", google: "Gemini", microsoft: "Copilot (add-on)" },
  { feature: "Best for", google: "Simple, real-time collaboration", microsoft: "Office power users & Teams" },
];

export default function CompareTable() {
  return (
    <section id="compare" className="mt-24 scroll-mt-28">
      <h2 className="text-2xl font-bold sm:text-3xl">
        Google Workspace vs Microsoft 365
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Both give your team professional email and productivity tools. Here&apos;s
        a quick comparison — not sure which fits? We&apos;ll advise for free.
      </p>

      <div className="mt-8 overflow-x-auto rounded-3xl glass">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-6 py-4 font-semibold text-muted">Feature</th>
              <th className="px-6 py-4 font-bold">Google Workspace</th>
              <th className="px-6 py-4 font-bold">Microsoft 365</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.feature}
                className={i % 2 ? "bg-white/[0.02]" : ""}
              >
                <td className="px-6 py-4 font-medium text-muted">{r.feature}</td>
                <td className="px-6 py-4">{r.google}</td>
                <td className="px-6 py-4">{r.microsoft}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
