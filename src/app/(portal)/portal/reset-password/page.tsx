"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const input =
  "w-full rounded-[11px] border border-white/[.12] bg-white/[.03] px-[15px] py-[13px] text-[14.5px] text-[#edeff3] outline-none transition-colors placeholder:text-[#737b8a] focus:border-[#5e5bff]";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const password = (f.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (f.elements.namedItem("confirm") as HTMLInputElement).value;
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/customers/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
      setError("That reset link is invalid or has expired. Request a new one.");
    }
  }

  if (!token) {
    return <p className="text-[15px] text-[#a4acba]">This reset link is missing its token. Please use the link from your email.</p>;
  }

  if (status === "done") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 grid h-[60px] w-[60px] place-items-center rounded-full bg-[#c9f25e]/[.14] text-[28px] text-[#c9f25e]">✓</div>
        <h2 className="mb-2 font-display text-2xl font-bold tracking-[-.02em]">Password updated</h2>
        <p className="mb-6 text-[15px] text-[#a4acba]">You can now sign in with your new password.</p>
        <Link href="/portal" className="inline-flex rounded-full bg-[#5e5bff] px-6 py-3 text-[14px] font-semibold text-white">
          Go to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold tracking-[-.02em]">Choose a new password</h1>
      <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-[#8a92a1]">
        New password
        <input name="password" type="password" placeholder="At least 8 characters" className={input} />
      </label>
      <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-[#8a92a1]">
        Confirm password
        <input name="confirm" type="password" placeholder="Re-enter your password" className={input} />
      </label>
      {error && <p className="text-[13px] text-[#ff8a8a]">{error}</p>}
      <button
        disabled={status === "sending"}
        className="mt-1 w-full rounded-[11px] bg-[#5e5bff] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(94,91,255,.4)] disabled:opacity-60"
      >
        {status === "sending" ? "Updating…" : "Update password →"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0a0c10] px-5">
      <div className="w-full max-w-[400px]">
        <Suspense fallback={<p className="text-[#a4acba]">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
