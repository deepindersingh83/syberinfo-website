export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-[1] pb-16 pt-[150px]">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000,transparent_75%)]" />
        <h1 className="font-display text-[clamp(34px,5vw,56px)] font-bold tracking-[-.03em]">
          {title}
        </h1>
        <p className="mt-3 font-mono text-[13px] text-muted-3">Last updated: {updated}</p>
        <div className="legal mt-10 space-y-5 leading-relaxed text-foreground/90">
          {children}
        </div>
      </div>
    </div>
  );
}
