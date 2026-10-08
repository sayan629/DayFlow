"use client";

import { Bell, Menu } from "lucide-react";
import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import AlarmList from "@/components/alarms/AlarmList";

export default function AlarmsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} />

        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs text-zinc-500">
                  Workspace
                </p>

                <p className="text-sm font-medium text-zinc-300">
                  Alarms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1500px] p-5 md:p-8">
              <div className="mb-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                  Workspace
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                  Alarms
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Manage your upcoming reminders and alarms.
                </p>
              </div>
              <AlarmList />
              {/* Empty state */}
              <section className="flex min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                    <Bell
                      size={24}
                      className="text-zinc-500"
                    />
                  </div>

                  <h2 className="mt-5 text-lg font-semibold">
                    No alarms yet
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
                    Your scheduled alarms and reminders
                    will appear here.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}