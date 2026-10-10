"use client";

import {
  Bell,
  CheckCircle2,
  Flame,
  ListTodo,
  Timer,
} from "lucide-react";
import { useMemo } from "react";

import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import TaskList from "@/components/tasks/TaskList";
import NextTaskCard from "@/components/scheduler/NextTaskCard";
import TodayTimeline from "@/components/dashboard/TodayTimeline";

import { useScheduler } from "@/hooks/useScheduler";
import { useTaskStore } from "@/store/taskStore";
import { getNextAlarm } from "@/lib/scheduler";

export default function HomePage() {
  const now = useScheduler();

  const allTasks = useTaskStore(
    (state) => state.tasks
  );

  const today = useMemo(() => {
    if (!now) return null;

    return now.toISOString().split("T")[0];
  }, [now]);

  const todayTasks = useMemo(() => {
    if (!today) return [];

    return allTasks.filter(
      (task) => task.date === today
    );
  }, [allTasks, today]);

  const completedTasks = useMemo(
    () =>
      todayTasks.filter(
        (task) => task.completed
      ),
    [todayTasks]
  );

  const remainingTasks =
    todayTasks.length -
    completedTasks.length;

  const completionPercentage =
    todayTasks.length === 0
      ? 0
      : Math.round(
          (completedTasks.length /
            todayTasks.length) *
            100
        );

  const nextAlarm = useMemo(() => {
    if (!now) return null;

    return getNextAlarm(
      allTasks,
      now
    );
  }, [allTasks, now]);

  const focusTime = useMemo(() => {
    const focusTasks = todayTasks.filter(
      (task) => task.completed
    );

    if (focusTasks.length === 0) {
      return "0m";
    }

    return `${focusTasks.length * 25}m`;
  }, [todayTasks]);

  if (!now || !today) {
    return null;
  }

  return (
    <main className="min-h-full">
      <div className="mx-auto w-full max-w-[1500px] space-y-8 p-5 md:p-8 lg:p-10">
        {/* Header */}
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-zinc-600">
              Personal OS
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Dashboard
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Stay focused. Stay organized.
            </p>
          </div>

          <AddTaskDialog />
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<ListTodo size={19} />}
            label="Today&apos;s Tasks"
            value={String(
              todayTasks.length
            ).padStart(2, "0")}
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
            value={focusTime}
            subtitle="Based on today&apos;s activity"
          />

          <StatCard
            icon={<Flame size={19} />}
            label="Current Streak"
            value="07"
            subtitle="Keep the momentum going"
          />
        </section>

        {/* Next Task */}
        <NextTaskCard />

        {/* Timeline */}
        <TodayTimeline />

        {/* Main Dashboard Grid */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Today's Schedule */}
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 md:px-6">
              <div>
                <h2 className="font-semibold text-white">
                  Today&apos;s Schedule
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Your tasks for today
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                <ListTodo
                  size={17}
                  className="text-zinc-500"
                />
              </div>
            </div>

            <div className="p-5 md:p-6">
              {todayTasks.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                    <ListTodo
                      size={20}
                      className="text-zinc-500"
                    />
                  </div>

                  <h3 className="mt-4 text-sm font-medium text-white">
                    No tasks for today
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-600">
                    Add a task to start building
                    your schedule.
                  </p>

                  <div className="mt-5">
                    <AddTaskDialog />
                  </div>
                </div>
              ) : (
                <TaskList />
              )}
            </div>
          </section>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Next Alarm */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
              <div className="border-b border-white/10 px-5 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-white">
                      Next Alarm
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                      Your upcoming reminder
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <Bell
                      size={17}
                      className="text-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {nextAlarm ? (
                  <>
                    <p className="text-4xl font-semibold tracking-tight text-white">
                      {formatTime(
                        nextAlarm.startTime!
                      )}
                    </p>

                    <p className="mt-2 text-sm font-medium text-zinc-200">
                      {nextAlarm.title}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {formatReminder(
                        nextAlarm.reminder ?? 0
                      )}
                    </p>

                    <div className="mt-6">
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500">
                            Category
                          </span>

                          <span className="text-xs capitalize text-zinc-300">
                            {nextAlarm.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                      <Bell
                        size={18}
                        className="text-zinc-600"
                      />
                    </div>

                    <h3 className="mt-4 text-sm font-medium text-zinc-300">
                      No upcoming alarms
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                      Your schedule is clear for
                      now.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Daily Progress */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">
                    Daily Progress
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Keep going
                  </p>
                </div>

                <span className="text-sm font-medium text-white">
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
                  {completedTasks.length} completed
                </span>

                <span>
                  {remainingTasks} remaining
                </span>
              </div>
            </section>

            {/* Productivity */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                  <Flame
                    size={18}
                    className="text-zinc-400"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Productivity
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Build consistency every day.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs leading-relaxed text-zinc-500">
                  Complete your scheduled tasks
                  and use Focus sessions to keep
                  your productivity streak alive.
                </p>
              </div>
            </section>
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
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400">
        {icon}
      </div>

      <p className="mt-5 text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {subtitle}
      </p>
    </div>
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(
    minutes
  ).padStart(2, "0")} ${period}`;
}

function formatReminder(minutes: number) {
  if (minutes === 0) {
    return "Alarm at start time";
  }

  if (minutes === 60) {
    return "Alarm 1 hour before";
  }

  return `Alarm ${minutes} minutes before`;
}