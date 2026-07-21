"use client";

import { useRouter } from "next/navigation";

export default function PortalLogout() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/customers/logout", { method: "POST" });
    router.push("/portal/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
    >
      Log out
    </button>
  );
}
