"use client";

import {
  Bell,
  BellOff,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { useMemo } from "react";

import { useTaskStore } from "@/store/taskStore";
import { useScheduler } from "@/hooks/useScheduler";

export default function AlarmList() {
  const tasks = useTaskStore((state) => state.tasks);

  const updateTask = useTaskStore(
    (state) => state.updateTask
  );

  /*
   * Get the current time through the scheduler.
   *
   * Do not use new Date() directly during render.
   * Next.js 16 Cache Components treats current-time
   * values during prerender as unstable.
   */
  const now = useScheduler();

  const today = now
    ? now.toISOString().split("T")[0]
    : null;

  const alarmTasks = useMemo(() => {
    if (!today) {
      return [];
    }

    return tasks
      .filter(
        (task) =>
          task.date === today &&
          task.startTime &&
          !task.completed
      )
      .sort((a, b) =>
        (a.startTime ?? "").localeCompare(
          b.startTime ?? ""
        )
      );
  }, [tasks, today]);

  const toggleAlarm = (
    taskId: string,
    enabled: boolean
  ) => {
    updateTask(taskId, {
      alarmEnabled: !enabled,
    });
  };

  /*
   * Wait until the scheduler provides the current
   * date. This happens after the initial prerender.
   */
  if (!now) {
    return null;
  }

  if (alarmTasks.length === 0) {
    return (
      <section className="flex min-h-[360px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <Bell
              size={24}
              className="text-zinc-500"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            No alarms scheduled
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
            Create a task with a start time to see its
            alarm here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              Today&apos;s Alarms
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              {alarmTasks.length}{" "}
              {alarmTasks.length === 1
                ? "alarm"
                : "alarms"}{" "}
              scheduled
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
            <Bell
              size={17}
              className="text-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Alarm list */}
      <div className="divide-y divide-white/10">
        {alarmTasks.map((task) => {
          const disabled =
            task.alarmEnabled === false;

          return (
            <div
              key={task.id}
              className={`flex items-center gap-4 px-6 py-5 transition ${
                disabled
                  ? "opacity-50"
                  : "hover:bg-white/[0.02]"
              }`}
            >
              {/* Time */}
              <div className="w-24 shrink-0">
                <p className="text-lg font-semibold tracking-tight">
                  {formatTime(task.startTime!)}
                </p>

                {task.endTime && (
                  <p className="mt-1 text-[11px] text-zinc-600">
                    until{" "}
                    {formatTime(task.endTime)}
                  </p>
                )}
              </div>

              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                {disabled ? (
                  <BellOff
                    size={17}
                    className="text-zinc-600"
                  />
                ) : (
                  <Clock3
                    size={17}
                    className="text-zinc-400"
                  />
                )}
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-medium">
                    {task.title}
                  </h3>

                  {task.completed && (
                    <CheckCircle2
                      size={14}
                      className="text-zinc-500"
                    />
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="capitalize">
                    {task.category}
                  </span>

                  <span className="text-zinc-700">
                    •
                  </span>

                  <span>
                    {formatReminder(
                      task.reminder ?? 0
                    )}
                  </span>
                </div>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() =>
                  toggleAlarm(
                    task.id,
                    task.alarmEnabled !== false
                  )
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  disabled
                    ? "bg-white/10"
                    : "bg-white"
                }`}
                aria-label={
                  disabled
                    ? "Enable alarm"
                    : "Disable alarm"
                }
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full transition-all ${
                    disabled
                      ? "left-1 bg-zinc-500"
                      : "left-6 bg-black"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const period = hours >= 12 ? "PM" : "AM";

  const displayHours =
    hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(
    2,
    "0"
  )} ${period}`;
}

function formatReminder(minutes: number) {
  if (minutes === 0) {
    return "At start time";
  }

  if (minutes === 60) {
    return "1 hour before";
  }

  return `${minutes} min before`;
}