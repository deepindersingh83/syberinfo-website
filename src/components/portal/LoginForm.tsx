"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      if (!res.ok) throw new Error("Invalid email or password.");
      router.push("/portal");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60"
        />
      </label>
      {status === "error" && <p className="text-sm text-pink-glow">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
