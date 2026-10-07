"use client";

import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import AlarmEngine from "@/components/alarms/AlarmEngine";
import AlarmRinging from "@/components/alarms/AlarmRinging";
import NextTaskCard from "@/components/scheduler/NextTaskCard";
import Sidebar from "@/components/layout/Sidebar";
import TaskList from "@/components/tasks/TaskList";
import { useTaskStore } from "@/store/taskStore";

import {
  Bell,
  CheckCircle2,
  Flame,
  ListTodo,
  Menu,
  MoreHorizontal,
  Timer,
} from "lucide-react";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  const allTasks = useTaskStore((state) => state.tasks);

  const tasks = allTasks.filter(
    (task) => task.date === today
  );

  const completedTasks = tasks.filter(
    (task) => task.completed
  );

  const remainingTasks =
    tasks.length - completedTasks.length;

  const completionPercentage =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks.length / tasks.length) * 100
        );

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* Alarm Engine */}
      <AlarmEngine />
      <AlarmRinging />

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
                onClick={() =>
                  setSidebarOpen(!sidebarOpen)
                }
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs text-zinc-500">
                  {today
                    ? new Date(
                        `${today}T00:00:00`
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                      })
                    : ""}
                </p>

                <p className="text-sm font-medium text-zinc-300">
                  {today
                    ? new Date(
                        `${today}T00:00:00`
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
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
            <div className="mx-auto max-w-[1500px] space-y-8 p-5 md:p-8">
              {/* Greeting */}
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="mb-2 text-sm text-zinc-500">
                    Good morning 👋
                  </p>

                  <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                    Let's make today count.
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    You have {tasks.length}{" "}
                    {tasks.length === 1
                      ? "task"
                      : "tasks"}{" "}
                    planned for today.
                  </p>
                </div>

                <AddTaskDialog />
              </div>

              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={<ListTodo size={19} />}
                  label="Today's Tasks"
                  value={String(tasks.length).padStart(
                    2,
                    "0"
                  )}
                  subtitle={`${remainingTasks} remaining`}
                />

                <StatCard
                  icon={<CheckCircle2 size={19} />}
                  label="Completed"
                  value={String(
                    completedTasks.length
                  ).padStart(2, "0")}
                  subtitle={`${completionPercentage}% complete`}
                />

                <StatCard
                  icon={<Timer size={19} />}
                  label="Focus Time"
                  value="3h 24m"
                  subtitle="+42m from yesterday"
                />

                <StatCard
                  icon={<Flame size={19} />}
                  label="Current Streak"
                  value="07"
                  subtitle="Best: 14 days"
                />
              </div>

              {/* Next Up */}
              <NextTaskCard />

              {/* Main Grid */}
              <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                {/* Schedule */}
                <section className="rounded-3xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center justify-between border-b border-white/10 p-5 md:p-6">
                    <div>
                      <h3 className="font-semibold">
                        Today's Schedule
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        Your timeline for today
                      </p>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </div>

                  <div className="p-5 md:p-6">
                    <TaskList />
                  </div>
                </section>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Next Alarm */}
                  <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
                    <div className="border-b border-white/10 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            Next Alarm
                          </h3>

                          <p className="mt-1 text-xs text-zinc-500">
                            Your upcoming reminder
                          </p>
                        </div>

                        <Bell
                          size={18}
                          className="text-zinc-500"
                        />
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-4xl font-semibold tracking-tight">
                        10:00
                        <span className="ml-1 text-base text-zinc-500">
                          AM
                        </span>
                      </p>

                      <p className="mt-2 text-sm font-medium">
                        DSA Practice
                      </p>

                      <div className="mt-6 flex items-center gap-2">
                        <button
                          type="button"
                          className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-black hover:bg-zinc-200"
                        >
                          View Task
                        </button>

                        <button
                          type="button"
                          className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
                        >
                          Snooze
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Progress */}
                  <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          Daily Progress
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          Keep going
                        </p>
                      </div>

                      <span className="text-sm font-medium">
                        {completionPercentage}%
                      </span>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white transition-all duration-500"
                        style={{
                          width: `${completionPercentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-4 flex justify-between text-xs text-zinc-500">
                      <span>
                        {completedTasks.length}{" "}
                        completed
                      </span>

                      <span>
                        {remainingTasks} remaining
                      </span>
                    </div>
                  </section>
                </div>
              </div>
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
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20 hover:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400">
          {icon}
        </div>

        <MoreHorizontal
          size={17}
          className="text-zinc-600"
        />
      </div>

      <p className="mt-5 text-xs text-zinc-500">
        {label}
      </p>

      <div className="mt-1 flex items-end justify-between">
        <p className="text-2xl font-semibold tracking-tight">
          {value}
        </p>
      </div>

      <p className="mt-1 text-xs text-zinc-600">
        {subtitle}
      </p>
    </div>
  );
}