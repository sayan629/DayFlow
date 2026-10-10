"use client";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";

import { useScheduler } from "@/hooks/useScheduler";
import {
  getTaskFocusStats,
  useFocusStore,
} from "@/store/focusStore";
import { useTaskStore } from "@/store/taskStore";

const CATEGORY_LABELS: Record<string, string> = {
  study: "Study",
  development: "Development",
  personal: "Personal",
  fitness: "Fitness",
  other: "Other",
};

export default function AnalyticsPage() {
  const now = useScheduler();

  const tasks = useTaskStore((state) => state.tasks);
  const sessionHistory = useFocusStore(
    (state) => state.sessionHistory
  );

  const today = useMemo(() => {
    if (!now) return null;

    return now.toISOString().split("T")[0];
  }, [now]);

  const analytics = useMemo(() => {
    if (!today || !now) {
      return null;
    }

    const todayTasks = tasks.filter(
      (task) => task.date === today
    );

    const completedTasks = todayTasks.filter(
      (task) => task.completed
    );

    const completionRate =
      todayTasks.length === 0
        ? 0
        : Math.round(
            (completedTasks.length /
              todayTasks.length) *
              100
          );

    const focusSessions = sessionHistory.filter(
      (session) => session.mode === "focus"
    );

    const totalFocusSeconds =
      focusSessions.reduce(
        (total, session) =>
          total + session.durationSeconds,
        0
      );

    const totalFocusMinutes = Math.floor(
      totalFocusSeconds / 60
    );

    const focusHours = Math.floor(
      totalFocusMinutes / 60
    );

    const focusMinutes =
      totalFocusMinutes % 60;

    const focusTime =
      focusHours > 0
        ? `${focusHours}h ${focusMinutes}m`
        : `${focusMinutes}m`;

    // -----------------------------
    // Task Categories
    // -----------------------------

    const categoryMap = new Map<
      string,
      {
        total: number;
        completed: number;
      }
    >();

    todayTasks.forEach((task) => {
      const existing =
        categoryMap.get(task.category) ?? {
          total: 0,
          completed: 0,
        };

      existing.total += 1;

      if (task.completed) {
        existing.completed += 1;
      }

      categoryMap.set(
        task.category,
        existing
      );
    });

    const categories = Array.from(
      categoryMap.entries()
    )
      .map(([category, data]) => ({
        category,
        ...data,
        percentage:
          data.total === 0
            ? 0
            : Math.round(
                (data.completed /
                  data.total) *
                  100
              ),
      }))
      .sort(
        (a, b) => b.total - a.total
      );

    // -----------------------------
    // Priority Breakdown
    // -----------------------------

    const priorityMap = new Map<
      string,
      number
    >();

    todayTasks.forEach((task) => {
      priorityMap.set(
        task.priority,
        (priorityMap.get(task.priority) ?? 0) +
          1
      );
    });

    const priorities = [
      "high",
      "medium",
      "low",
    ].map((priority) => ({
      priority,
      count:
        priorityMap.get(priority) ?? 0,
    }));

    // -----------------------------
    // Last 7 Days
    // -----------------------------

    const last7Days = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(
          now.getTime()
        );

        date.setDate(
          date.getDate() - (6 - index)
        );

        const dateString =
          date.toISOString().split("T")[0];

        const dayTasks = tasks.filter(
          (task) =>
            task.date === dateString
        );

        const completed = dayTasks.filter(
          (task) => task.completed
        ).length;

        const focusForDay =
          focusSessions.filter((session) => {
            const sessionDate =
              session.completedAt.split("T")[0];

            return sessionDate === dateString;
          });

        const focusMinutes = Math.floor(
          focusForDay.reduce(
            (total, session) =>
              total +
              session.durationSeconds,
            0
          ) / 60
        );

        return {
          date: dateString,
          label: date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),
          completed,
          total: dayTasks.length,
          focusMinutes,
        };
      }
    );

    const maxCompleted = Math.max(
      ...last7Days.map(
        (day) => day.completed
      ),
      1
    );

    const maxFocus = Math.max(
      ...last7Days.map(
        (day) => day.focusMinutes
      ),
      1
    );

    // -----------------------------
    // Task Focus Analytics
    // -----------------------------

    const taskFocusMap = new Map<
      string,
      ReturnType<typeof getTaskFocusStats>
    >();

    focusSessions.forEach((session) => {
      if (!session.taskId) return;

      if (
        !taskFocusMap.has(session.taskId)
      ) {
        taskFocusMap.set(
          session.taskId,
          getTaskFocusStats(
            sessionHistory,
            session.taskId
          )
        );
      }
    });

    const focusedTasks = Array.from(
      taskFocusMap.values()
    )
      .filter(Boolean)
      .sort(
        (a, b) =>
          (b?.totalSeconds ?? 0) -
          (a?.totalSeconds ?? 0)
      )
      .slice(0, 5);

    return {
      todayTasks,
      completedTasks,
      completionRate,
      focusSessions,
      focusTime,
      categories,
      priorities,
      last7Days,
      maxCompleted,
      maxFocus,
      focusedTasks,
    };
  }, [
    today,
    now,
    tasks,
    sessionHistory,
  ]);

  if (!now || !analytics) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-8 text-white lg:px-10">
      <div className="mx-auto min-h-screen max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <BarChart3
                size={20}
                className="text-zinc-300"
              />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-600">
                Personal OS
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                Analytics
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Understand your productivity and
                focus patterns.
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={
              <CheckCircle2 size={18} />
            }
            label="Completion Rate"
            value={`${analytics.completionRate}%`}
            subtitle={`${analytics.completedTasks.length} of ${analytics.todayTasks.length} tasks completed`}
          />

          <StatCard
            icon={<Clock3 size={18} />}
            label="Focus Time"
            value={analytics.focusTime}
            subtitle={`${analytics.focusSessions.length} focus sessions`}
          />

          <StatCard
            icon={<Target size={18} />}
            label="Tasks Today"
            value={String(
              analytics.todayTasks.length
            )}
            subtitle={`${analytics.completedTasks.length} completed`}
          />

          <StatCard
            icon={<Flame size={18} />}
            label="Focus Sessions"
            value={String(
              analytics.focusSessions.length
            )}
            subtitle="All recorded sessions"
          />
        </div>

        {/* 7-Day Activity */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">
                7-Day Activity
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Your task completion and focus
                activity.
              </p>
            </div>

            <TrendingUp
              size={18}
              className="text-zinc-500"
            />
          </div>

          <div className="mt-8 grid grid-cols-7 gap-3">
            {analytics.last7Days.map(
              (day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center"
                >
                  <div className="flex h-44 w-full items-end justify-center gap-1.5 rounded-2xl border border-white/5 bg-white/[0.015] px-2 pb-3">
                    <div
                      className="w-2.5 rounded-full bg-white/80 transition-all"
                      style={{
                        height: `${Math.max(
                          6,
                          (day.completed /
                            analytics.maxCompleted) *
                            100
                        )}%`,
                      }}
                      title={`${day.completed} completed tasks`}
                    />

                    <div
                      className="w-2.5 rounded-full bg-white/20 transition-all"
                      style={{
                        height: `${Math.max(
                          6,
                          (day.focusMinutes /
                            analytics.maxFocus) *
                            100
                        )}%`,
                      }}
                      title={`${day.focusMinutes} focus minutes`}
                    />
                  </div>

                  <span className="mt-3 text-[11px] text-zinc-500">
                    {day.label}
                  </span>

                  <span className="mt-1 text-xs font-medium text-zinc-300">
                    {day.completed}
                  </span>
                </div>
              )
            )}
          </div>

          <div className="mt-5 flex items-center gap-5 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/80" />
              Completed tasks
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/20" />
              Focus time
            </div>
          </div>
        </section>

        {/* Lower Analytics */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          {/* Categories */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <div>
              <h2 className="font-semibold">
                Task Categories
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                How today&apos;s workload is
                distributed.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {analytics.categories.length ===
              0 ? (
                <EmptyState text="No tasks recorded today." />
              ) : (
                analytics.categories.map(
                  (item) => (
                    <div
                      key={item.category}
                    >
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-200">
                          {CATEGORY_LABELS[
                            item.category
                          ] ??
                            item.category}
                        </span>

                        <span className="text-xs text-zinc-500">
                          {item.completed}/
                          {item.total}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1.5 text-[11px] text-zinc-600">
                        {item.percentage}% complete
                      </p>
                    </div>
                  )
                )
              )}
            </div>
          </section>

          {/* Priority */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <div>
              <h2 className="font-semibold">
                Priority Breakdown
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Today&apos;s tasks by priority.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              {analytics.priorities.map(
                (item) => {
                  const label =
                    item.priority
                      .charAt(0)
                      .toUpperCase() +
                    item.priority.slice(1);

                  return (
                    <div
                      key={item.priority}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            item.priority ===
                            "high"
                              ? "bg-white"
                              : item.priority ===
                                  "medium"
                                ? "bg-white/50"
                                : "bg-white/20"
                          }`}
                        />

                        <span className="text-sm text-zinc-300">
                          {label}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-zinc-200">
                        {item.count}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        </div>

        {/* Focused Tasks */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <div>
            <h2 className="font-semibold">
              Most Focused Tasks
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Tasks where you have spent the most
              focus time.
            </p>
          </div>

          <div className="mt-6">
            {analytics.focusedTasks.length ===
            0 ? (
              <EmptyState text="Complete a focus session to see task analytics." />
            ) : (
              <div className="space-y-3">
                {analytics.focusedTasks.map(
                  (item, index) => {
                    if (!item) return null;

                    return (
                      <div
                        key={item.taskId}
                        className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-xs font-semibold text-zinc-400">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-200">
                            {item.taskTitle}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {item.sessions}{" "}
                            {item.sessions === 1
                              ? "session"
                              : "sessions"}
                          </p>
                        </div>

                        <span className="text-sm font-medium text-zinc-300">
                          {formatDuration(
                            item.totalSeconds
                          )}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>

        {/* Today's Summary */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <Target
                size={17}
                className="text-zinc-400"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Today&apos;s Summary
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Your current productivity snapshot.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <SummaryItem
              label="Tasks completed"
              value={`${analytics.completedTasks.length}/${analytics.todayTasks.length}`}
            />

            <SummaryItem
              label="Focus time"
              value={analytics.focusTime}
            />

            <SummaryItem
              label="Completion"
              value={`${analytics.completionRate}%`}
            />
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
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-zinc-600">
        {subtitle}
      </p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-zinc-200">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-600">
      {text}
    </div>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(
    seconds / 60
  );

  const hours = Math.floor(
    minutes / 60
  );

  const remainingMinutes =
    minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${minutes}m`;
}