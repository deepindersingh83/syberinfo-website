import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/LoginForm";
import { getCurrentCustomer } from "@/lib/customer";

export const dynamic = "force-dynamic";

export default async function PortalLoginPage() {
  const customer = await getCurrentCustomer();
  if (customer) redirect("/portal");

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-glow to-violet-glow font-mono text-sm font-black text-ink-950">
            S
          </span>
          <span className="text-lg font-bold tracking-tight">
            Syber<span className="text-gradient">Info</span>
          </span>
        </Link>
        <div className="rounded-3xl glass p-8">
          <h1 className="text-2xl font-bold">Client login</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your services, domains and invoices.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Need an account?{" "}
          <Link href="/contact" className="text-foreground underline underline-offset-4">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
