"use client";

import {
  Bell,
  CalendarDays,
  Clock3,
  Flame,
  Home,
  ListTodo,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open: boolean;
}

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
    href: "/",
  },
];

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        open ? "w-64" : "w-20"
      } hidden shrink-0 border-r border-white/10 bg-[#0c0c0f] transition-all duration-300 lg:block`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
              <Clock3 size={19} />
            </div>

            {open && (
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
                : pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />

                {open && (
                  <span className="font-medium">
                    {item.label}
                  </span>
                )}

                {open && item.label === "Alarms" && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />
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
            <Settings size={18} />

            {open && <span>Settings</span>}
          </button>

          {open && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Flame
                  size={16}
                  className="text-orange-400"
                />

                <span className="text-sm font-medium">
                  7 day streak
                </span>
              </div>

              <p className="text-xs leading-relaxed text-zinc-500">
                Keep completing your tasks to maintain
                your streak.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}