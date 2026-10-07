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