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
    href: "/",
  },
  {
    label: "Focus",
    icon: Target,
    href: "/",
  },
  {
    label: "Analytics",
    icon: TrendingUp,
    href: "/",
  },
];

export default function Sidebar({
  open,
}: SidebarProps) {
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