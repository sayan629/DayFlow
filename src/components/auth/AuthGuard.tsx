"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useUserStore } from "@/store/userStore";

interface AuthGuardProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const initialized = useUserStore(
    (state) => state.initialized
  );

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!initialized || loading) {
      return;
    }

    if (!user && !isPublicRoute) {
      router.replace("/login");
    }

    if (user && isPublicRoute) {
      router.replace("/");
    }
  }, [
    initialized,
    loading,
    user,
    isPublicRoute,
    router,
  ]);

  /*
   * LOGIN / REGISTER
   *
   * Public pages are rendered WITHOUT AppShell.
   * Therefore:
   * - no sidebar
   * - no dashboard header
   * - no workspace menu
   */
  if (isPublicRoute) {
    return <>{children}</>;
  }

  /*
   * Protected pages
   */
  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />

          <p className="text-sm text-white/60">
            Loading DayFlow...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />

          <p className="text-sm text-white/60">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}