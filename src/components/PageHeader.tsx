import Reveal from "@/components/Reveal";

/**
 * Shared page intro used across the managed-IT marketing pages.
 */
export default function PageHeader({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-8 pt-[150px] sm:px-10">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000,transparent_75%)]" />
      <Reveal>
        <div className="mb-3.5 font-mono text-[13px] tracking-[.05em] text-indigo">{tag}</div>
        <h1 className="max-w-[20ch] font-display text-[clamp(36px,5.5vw,64px)] font-bold leading-[1.02] tracking-[-.03em]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-[56ch] text-[clamp(16px,1.6vw,18px)] leading-relaxed text-muted">
            {subtitle}
          </p>
        )}
      </Reveal>
    </div>
  );
}
