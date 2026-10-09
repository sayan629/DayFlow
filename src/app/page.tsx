"use client";

import {
  Bell,
  CheckCircle2,
  Clock3,
  Menu,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import TaskList from "@/components/tasks/TaskList";
import NextTaskCard from "@/components/scheduler/NextTaskCard";

import { useScheduler } from "@/hooks/useScheduler";
import { getNextAlarm } from "@/lib/scheduler";
import { useTaskStore } from "@/store/taskStore";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /*
   * Current time comes from the scheduler instead of
   * calling new Date() during render.
   *
   * This is required for Next.js 16 Cache Components.
   */
  const now = useScheduler();

  const tasks = useTaskStore((state) => state.tasks);

  const today = now
    ? now.toISOString().split("T")[0]
    : null;

  const todayTasks = useMemo(() => {
    if (!today) {
      return [];
    }

    return tasks.filter(
      (task) => task.date === today
    );
  }, [tasks, today]);

  const completedTasks = useMemo(() => {
    return todayTasks.filter(
      (task) => task.completed
    );
  }, [todayTasks]);

  const activeTasks = useMemo(() => {
    return todayTasks.filter(
      (task) => !task.completed
    );
  }, [todayTasks]);

  /*
   * Find the next alarm whenever the task list or
   * current scheduler time changes.
   */
  const nextAlarm = useMemo(() => {
    if (!now) {
      return null;
    }

    return getNextAlarm(tasks);
  }, [tasks, now]);

  /*
   * Convert the task start time + reminder into
   * the actual time when the alarm will ring.
   */
  const alarmTime = useMemo(() => {
    if (!nextAlarm?.startTime) {
      return null;
    }

    const [hours, minutes] = nextAlarm.startTime
      .split(":")
      .map(Number);

    const alarmMinutes =
      hours * 60 +
      minutes -
      (nextAlarm.reminder ?? 0);

    const normalizedMinutes =
      (alarmMinutes + 24 * 60) %
      (24 * 60);

    const alarmHour = Math.floor(
      normalizedMinutes / 60
    );

    const alarmMinute =
      normalizedMinutes % 60;

    return `${String(alarmHour).padStart(
      2,
      "0"
    )}:${String(alarmMinute).padStart(
      2,
      "0"
    )}`;
  }, [nextAlarm]);

  const progress =
    todayTasks.length > 0
      ? Math.round(
          (completedTasks.length /
            todayTasks.length) *
            100
        )
      : 0;

  /*
   * Prevent the initial prerender from rendering
   * current-time-dependent UI.
   */
  if (!now) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} />

        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(
                    (open) => !open
                  )
                }
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Toggle sidebar"
                title="Toggle sidebar"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs text-zinc-500">
                  Personal OS
                </p>

                <p className="text-sm font-medium text-zinc-300">
                  Dashboard
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

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1500px] p-5 md:p-8">
              {/* Page Header */}
              <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                    Personal OS
                  </p>

                  <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                    Dashboard
                  </h1>

                  <p className="mt-2 text-sm text-zinc-500">
                    Stay focused. Stay organized.
                  </p>
                </div>

                <AddTaskDialog />
              </div>

              {/* Stats */}
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatCard
                  icon={<Clock3 size={19} />}
                  label="Today&apos;s Tasks"
                  value={String(
                    todayTasks.length
                  )}
                />

                <StatCard
                  icon={<Target size={19} />}
                  label="Active"
                  value={String(
                    activeTasks.length
                  )}
                />

                <StatCard
                  icon={<CheckCircle2 size={19} />}
                  label="Completed"
                  value={String(
                    completedTasks.length
                  )}
                />
              </div>

              {/* Next Task */}
              <NextTaskCard />

              {/* Next Alarm */}
              <section className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                      Next Alarm
                    </p>

                    <h2 className="mt-1 text-sm font-medium text-zinc-300">
                      Your next scheduled reminder
                    </h2>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <Bell
                      size={16}
                      className="text-zinc-500"
                    />
                  </div>
                </div>

                {nextAlarm ? (
                  <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                        <Bell
                          size={19}
                          className="text-zinc-400"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                          Alarm
                        </p>

                        <h3 className="mt-1 text-lg font-semibold text-white">
                          {nextAlarm.title}
                        </h3>

                        <p className="mt-2 text-xs text-zinc-500">
                          {nextAlarm.reminder === 0
                            ? "At task start"
                            : `${nextAlarm.reminder} min before task`}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 sm:min-w-[150px] sm:text-right">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                        Rings at
                      </p>

                      <p className="mt-1 font-mono text-xl font-semibold text-white">
                        {alarmTime ?? "--:--"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[120px] items-center p-6">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-300">
                        No upcoming alarms
                      </h3>

                      <p className="mt-1 text-xs text-zinc-600">
                        You have no active alarms
                        scheduled for today.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Daily Progress */}
              <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                      Daily Progress
                    </p>

                    <h2 className="mt-1 text-sm font-medium text-zinc-300">
                      Today&apos;s completion
                    </h2>
                  </div>

                  <span className="text-lg font-semibold">
                    {progress}%
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-zinc-600">
                  {completedTasks.length} of{" "}
                  {todayTasks.length} tasks completed
                </p>
              </section>

              {/* Today's Tasks */}
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
                <div className="border-b border-white/10 px-6 py-5">
                  <h2 className="font-semibold">
                    Today&apos;s Tasks
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    Your scheduled tasks for today
                  </p>
                </div>

                <div className="p-5 md:p-6">
                  <TaskList />
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20 hover:bg-white/[0.03]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400">
        {icon}
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}