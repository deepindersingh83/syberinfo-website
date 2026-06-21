import { Aurora, ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="relative grid min-h-[70vh] place-items-center px-5 pt-36">
      <Aurora />
      <div className="text-center">
        <div className="text-8xl font-black text-gradient">404</div>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Back home →</ButtonLink>
          <ButtonLink href="/contact" variant="ghost">
            Contact us
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
