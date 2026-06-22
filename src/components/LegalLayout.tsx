import { Aurora } from "@/components/ui";

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
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-3xl px-5">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>
        <div className="legal mt-10 space-y-5 leading-relaxed text-foreground/90">
          {children}
        </div>
      </div>
    </div>
  );
}
