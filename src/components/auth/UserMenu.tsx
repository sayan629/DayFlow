"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useUserStore } from "@/store/userStore";
import { logout } from "@/lib/clientAuth";

export default function UserMenu() {
  const router = useRouter();

  const user = useUserStore(
    (state) => state.user
  );

  const [loading, setLoading] = useState(false);

  if (!user) {
    return null;
  }

  async function handleLogout() {
    setLoading(true);

    const success = await logout();

    if (success) {
      router.replace("/login");
      router.refresh();
    }

    setLoading(false);
  }

  const initial =
    user.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white ring-2 ring-white/10">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      {/* User information */}
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-medium text-white">
          {user.name}
        </p>

        <p className="truncate text-xs text-white/50">
          {user.email}
        </p>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Logging out..."
          : "Logout"}
      </button>
    </div>
  );
}