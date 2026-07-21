import Link from "next/link";

/**
 * Sticky "book an audit" bar shown only on small screens.
 */
export default function MobileCTA() {
  return (
    <Link
      href="/book"
      className="fixed inset-x-4 bottom-4 z-[60] flex items-center justify-center gap-2 rounded-2xl bg-indigo p-4 text-base font-semibold text-white shadow-[0_10px_34px_rgba(94,91,255,.5)] lg:hidden"
    >
      Book a free IT audit →
    </Link>
  );
}
