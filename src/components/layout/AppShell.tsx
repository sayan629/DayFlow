"use client";

import {
  Bell,
  CalendarDays,
  Clock3,
  Flame,
  Home,
  ListTodo,
  Menu,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { useScheduler } from "@/hooks/useScheduler";

const navigation = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    label: "Tasks",
    icon: ListTodo,
    href: "/tasks",
  },
  {
    label: "Calendar",
    icon: CalendarDays,
    href: "/calendar",
  },
  {
    label: "Alarms",
    icon: Bell,
    href: "/alarms",
  },
  {
    label: "Focus",
    icon: Target,
    href: "/focus",
  },
  {
    label: "Analytics",
    icon: TrendingUp,
    href: "/analytics",
  },
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const today = useScheduler();

  const dateInfo = useMemo(() => {
    if (!today) {
      return {
        weekday: "",
        fullDate: "",
      };
    }

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

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } hidden shrink-0 border-r border-white/10 bg-[#0c0c0f] transition-all duration-300 lg:block`}
        >
          <div className="flex h-full flex-col">

            {/* Logo */}
            <div className="flex h-20 items-center border-b border-white/10 px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                  <Clock3 size={19} />
                </div>

                {sidebarOpen && (
                  <div>
                    <h1 className="text-lg font-semibold tracking-tight">
                      DayFlow
                    </h1>

                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Personal OS
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
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
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                      isActive
                        ? "bg-white text-black shadow-sm"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={18}
                      className="shrink-0"
                    />

                    {sidebarOpen && (
                      <span className="font-medium">
                        {item.label}
                      </span>
                    )}

                    {sidebarOpen &&
                      item.label === "Alarms" && (
                        <span
                          className={`ml-auto h-2 w-2 rounded-full ${
                            isActive
                              ? "bg-red-500"
                              : "bg-red-500"
                          }`}
                        />
                      )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-white/10 p-4">

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <Settings
                  size={18}
                  className="shrink-0"
                />

                {sidebarOpen && (
                  <span>
                    Settings
                  </span>
                )}
              </button>

              {sidebarOpen && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Flame
                      size={16}
                      className="text-orange-400"
                    />

                    <span className="text-sm font-medium">
                      Productivity
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-zinc-500">
                    Stay consistent and keep
                    making progress every day.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col">

          {/* Header */}
          <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-[#09090b]/95 px-5 backdrop-blur md:px-8">

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(
                    (current) => !current
                  )
                }
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Toggle sidebar"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs text-zinc-500">
                  {dateInfo.weekday}
                </p>

                <p className="text-sm font-medium text-zinc-300">
                  {dateInfo.fullDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Notifications"
              >
                <Bell size={18} />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
              </button>

              <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-zinc-300 to-zinc-600 text-sm font-semibold text-black">
                  S
                </div>

                <div className="hidden md:block">
                  <p className="text-sm font-medium">
                    Sayan
                  </p>

                  <p className="text-xs text-zinc-500">
                    My workspace
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}