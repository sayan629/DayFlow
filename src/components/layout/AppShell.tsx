"use client";

import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Flame,
  Home,
  ListTodo,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useScheduler } from "@/hooks/useScheduler";
import { useUserStore } from "@/store/userStore";

const navigation = [
  { label: "Dashboard", icon: Home, href: "/" },
  { label: "Tasks", icon: ListTodo, href: "/tasks" },
  { label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { label: "Alarms", icon: Bell, href: "/alarms" },
  { label: "Focus", icon: Target, href: "/focus" },
  { label: "Analytics", icon: TrendingUp, href: "/analytics" },
];

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0e]";

/* ------------------------------------------------------------------ */
/* Tooltip shown only when the sidebar is collapsed                    */
/* ------------------------------------------------------------------ */

function Tip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#0b0b0e] px-2.5 py-1.5 text-xs font-medium text-zinc-200 opacity-0 shadow-xl shadow-black/40 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar contents (shared by desktop sidebar + mobile drawer)       */
/* ------------------------------------------------------------------ */

function SidebarContent({
  collapsed,
  pathname,
  onNavigate,
  onClose,
}: {
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const user = useUserStore((state) => state.user);

  const userName = user?.name?.trim() || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div
        className={`flex h-20 shrink-0 items-center border-b border-white/[0.07] ${
          collapsed ? "justify-center px-3" : "justify-between px-5"
        }`}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-2xl ${focusRing}`}
          aria-label="DayFlow home"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.08)] ring-1 ring-white/20 transition-transform duration-300 hover:rotate-[-6deg]">
            <Clock3 size={20} strokeWidth={2.2} />

            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b0b0e]" />
            </span>
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-[19px] font-semibold leading-none tracking-tight text-white">
                DayFlow
              </h1>

              <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.24em] text-zinc-600">
                Personal OS
              </p>
            </div>
          )}
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`rounded-xl p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white ${focusRing}`}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {!collapsed && (
          <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Workspace
          </p>
        )}

        <nav className="space-y-1.5" aria-label="Primary">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={`group relative flex items-center rounded-[14px] transition-all duration-200 ${focusRing} ${
                  collapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-3.5 py-2.5"
                } ${
                  isActive
                    ? "bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,0.06)]"
                    : "text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-white" />
                )}

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-all duration-200 ${
                    isActive
                      ? "bg-black/[0.06]"
                      : "group-hover:bg-white/[0.05]"
                  } ${!isActive ? "group-hover:scale-105" : ""}`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>

                {!collapsed && (
                  <span
                    className={`text-[13px] font-medium tracking-[-0.005em] ${
                      isActive
                        ? "text-black"
                        : "text-zinc-400 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {item.label === "Alarms" && (
                  <span
                    className={`flex h-2 w-2 ${
                      collapsed ? "absolute right-2.5 top-2.5" : "ml-auto"
                    }`}
                  >
                    <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-500 opacity-50" />

                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full bg-red-500 ${
                        collapsed ? "ring-2 ring-[#0b0b0e]" : ""
                      }`}
                    />
                  </span>
                )}

                {collapsed && <Tip label={item.label} />}
              </Link>
            );
          })}
        </nav>

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {!collapsed && (
          <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            System
          </p>
        )}

        <button
          type="button"
          aria-label={collapsed ? "Settings" : undefined}
          className={`group relative flex w-full items-center rounded-[14px] text-zinc-500 transition-all duration-200 hover:bg-white/[0.045] hover:text-zinc-200 ${focusRing} ${
            collapsed ? "justify-center px-3 py-3" : "gap-3 px-3.5 py-2.5"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-all duration-200 group-hover:bg-white/[0.05]">
            <Settings
              size={18}
              strokeWidth={1.8}
              className="transition-transform duration-500 group-hover:rotate-90"
            />
          </span>

          {!collapsed && (
            <span className="text-[13px] font-medium">Settings</span>
          )}

          {collapsed && <Tip label="Settings" />}
        </button>
      </div>

      {/* Bottom */}
      <div className="shrink-0 border-t border-white/[0.07] p-3">
        {collapsed ? (
          <div className="flex justify-center py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-600 text-sm font-semibold text-black ring-2 ring-white/10">
              {userInitial}
            </div>
          </div>
        ) : (
          <>
            {/* Productivity card */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.015] p-4 transition-colors duration-300 hover:border-white/[0.14]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-400/[0.06] blur-2xl transition-opacity duration-500 group-hover:bg-orange-400/[0.1]" />

              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-400/10 ring-1 ring-orange-400/10">
                      <Flame size={14} className="text-orange-400" />
                    </div>

                    <span className="text-xs font-semibold text-zinc-300">
                      Productivity
                    </span>
                  </div>

                  <span className="text-[10px] font-medium text-zinc-600">
                    Today
                  </span>
                </div>

                <div className="mb-4 flex items-end justify-between">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-semibold leading-none tracking-tight text-white tabular-nums">
                      07
                    </span>

                    <span className="ml-1.5 text-[10px] text-zinc-600">
                      day streak
                    </span>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    +12%
                  </span>
                </div>

                {/* 7-day streak segments */}
                <div className="flex gap-1" aria-hidden>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-1 flex-1 rounded-full bg-white/70"
                    />
                  ))}
                </div>

                <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">
                  Keep your momentum going.
                </p>
              </div>
            </div>

            {/* Profile */}
            <button
              type="button"
              className={`group mt-3 flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-2.5 text-left transition hover:border-white/[0.06] hover:bg-white/[0.025] ${focusRing}`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-600 text-sm font-semibold text-black ring-2 ring-white/10">
                {userInitial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-zinc-300">
                  {userName}
                </p>

                <p className="truncate text-[10px] text-zinc-600">
                  Personal workspace
                </p>
              </div>

              <ChevronRight
                size={14}
                className="ml-auto text-zinc-700 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-400"
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App shell                                                           */
/* ------------------------------------------------------------------ */

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useUserStore((state) => state.user);

  const userName = user?.name?.trim() || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const today = useScheduler();

  const dateInfo = useMemo(() => {
    if (!today) return { weekday: "", fullDate: "" };

    return {
      weekday: today.toLocaleDateString("en-US", {
        weekday: "long",
      }),

      fullDate: today.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };
  }, [today]);

  /* Close drawer on Escape + lock body scroll while open */
  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const iconBtn =
    "rounded-xl border border-transparent p-2 text-zinc-500 transition hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-white focus-visible:ring-2 focus-visible:ring-white/30 outline-none";

  return (
    <main className="min-h-screen bg-[#09090b] text-white antialiased selection:bg-white selection:text-black">
      <div className="flex min-h-screen">
        {/* ============ DESKTOP SIDEBAR ============ */}
        <aside
          className={`${
            sidebarOpen ? "w-72" : "w-[88px]"
          } sticky top-0 hidden h-screen shrink-0 border-r border-white/[0.07] bg-[#0b0b0e] transition-[width] duration-300 ease-out lg:block`}
        >
          <SidebarContent
            collapsed={!sidebarOpen}
            pathname={pathname}
          />
        </aside>

        {/* ============ MOBILE DRAWER ============ */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            mobileOpen ? "" : "pointer-events-none"
          }`}
          aria-hidden={!mobileOpen}
        >
          <div
            onClick={() => setMobileOpen(false)}
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <aside
            className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-white/[0.07] bg-[#0b0b0e] shadow-2xl shadow-black/60 transition-transform duration-300 ease-out ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SidebarContent
              collapsed={false}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>

        {/* ============ MAIN ============ */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#09090b]/80 px-5 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={`${iconBtn} lg:hidden`}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              {/* Desktop collapse */}
              <button
                type="button"
                onClick={() => setSidebarOpen((c) => !c)}
                className={`${iconBtn} hidden lg:block`}
                aria-label={
                  sidebarOpen
                    ? "Collapse sidebar"
                    : "Expand sidebar"
                }
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? (
                  <PanelLeftClose size={19} />
                ) : (
                  <PanelLeftOpen size={19} />
                )}
              </button>

              <div className="h-8 w-px bg-white/[0.07]" />

              <div className="min-h-[36px]">
                <p className="text-[11px] font-medium text-zinc-600">
                  {dateInfo.weekday || "\u00A0"}
                </p>

                <p className="text-sm font-medium tracking-tight text-zinc-300">
                  {dateInfo.fullDate || "\u00A0"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification */}
              <button
                type="button"
                className="group relative rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 text-zinc-500 outline-none transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label="Notifications"
              >
                <Bell
                  size={17}
                  strokeWidth={1.8}
                  className="origin-top transition-transform group-hover:rotate-[14deg]"
                />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
              </button>

              {/* Profile */}
              <button
                type="button"
                className="group flex items-center gap-3 rounded-2xl border-l border-white/[0.07] py-1 pl-4 pr-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-600 text-sm font-semibold text-black shadow-lg ring-2 ring-white/10 transition group-hover:ring-white/25">
                  {userInitial}
                </div>

                <div className="hidden md:block">
                  <p className="text-sm font-medium leading-tight text-zinc-300">
                    {userName}
                  </p>

                  <p className="text-[11px] text-zinc-600">
                    My workspace
                  </p>
                </div>
              </button>
            </div>
          </header>

          {/* Page content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}