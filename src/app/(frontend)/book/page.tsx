import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import BookingWidget from "@/components/BookingWidget";

export const metadata: Metadata = {
  title: "Book a free IT audit",
  description:
    "Book a free 30-minute IT audit with a SyberInfo engineer. We'll map your setup, flag the risks and show you exactly what we'd do — no obligation.",
};

export default function BookPage() {
  return (
    <>
      <PageHeader
        tag="BOOK A CALL"
        title={
          <>
            Book your free <span className="text-indigo">IT audit</span>.
          </>
        }
        subtitle="Thirty minutes with a real engineer. We'll map your current setup, flag the risks, and show you exactly what we'd do — no obligation, no hard sell."
      />
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-24 pt-8 sm:px-10">
        <BookingWidget />
      </section>
    </>
  );
}
