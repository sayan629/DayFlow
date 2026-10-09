"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ListTodo,
} from "lucide-react";
import { useMemo } from "react";

import { useScheduler } from "@/hooks/useScheduler";
import {
  getNextScheduledTask,
  getTaskProgress,
  getTaskStatus,
} from "@/lib/scheduler";
import { useTaskStore } from "@/store/taskStore";

export default function NextTaskCard() {
  const now = useScheduler();

  const tasks = useTaskStore(
    (state) => state.tasks
  );

  const toggleTask = useTaskStore(
    (state) => state.toggleTask
  );

  const nextTask = useMemo(() => {
    if (!now) {
      return null;
    }

    return getNextScheduledTask(tasks, now);
  }, [tasks, now]);

  const taskStatus = useMemo(() => {
    if (!nextTask || !now) {
      return null;
    }

    return getTaskStatus(nextTask, now);
  }, [nextTask, now]);

  const progress = useMemo(() => {
    if (!nextTask || !now) {
      return 0;
    }

    return getTaskProgress(nextTask, now);
  }, [nextTask, now]);

  const countdown = useMemo(() => {
    if (!nextTask?.startTime || !now) {
      return null;
    }

    const [hours, minutes] =
      nextTask.startTime
        .split(":")
        .map(Number);

    const taskTime = new Date(now);

    taskTime.setHours(
      hours,
      minutes,
      0,
      0
    );

    const difference =
      taskTime.getTime() -
      now.getTime();

    if (difference <= 0) {
      return "Starting now";
    }

    const totalSeconds = Math.floor(
      difference / 1000
    );

    const hoursLeft = Math.floor(
      totalSeconds / 3600
    );

    const minutesLeft = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const secondsLeft =
      totalSeconds % 60;

    if (hoursLeft > 0) {
      return `${hoursLeft}h ${String(
        minutesLeft
      ).padStart(2, "0")}m`;
    }

    return `${String(minutesLeft).padStart(
      2,
      "0"
    )}:${String(secondsLeft).padStart(
      2,
      "0"
    )}`;
  }, [nextTask, now]);

  const statusConfig = useMemo(() => {
    switch (taskStatus) {
      case "current":
        return {
          label: "Current",
          className:
            "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
        };

      case "missed":
        return {
          label: "Missed",
          className:
            "border-amber-400/20 bg-amber-400/10 text-amber-400",
        };

      case "completed":
        return {
          label: "Completed",
          className:
            "border-zinc-400/20 bg-zinc-400/10 text-zinc-400",
        };

      default:
        return {
          label: "Upcoming",
          className:
            "border-blue-400/20 bg-blue-400/10 text-blue-400",
        };
    }
  }, [taskStatus]);

  if (!now) {
    return null;
  }

  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
            Next Up
          </p>

          <h2 className="mt-1 text-sm font-medium text-zinc-300">
            Your next scheduled task
          </h2>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Clock3
            size={16}
            className="text-zinc-500"
          />
        </div>
      </div>

      {nextTask ? (
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Task information */}
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                {taskStatus === "completed" ? (
                  <CheckCircle2
                    size={19}
                    className="text-emerald-400"
                  />
                ) : (
                  <ListTodo
                    size={19}
                    className="text-zinc-400"
                  />
                )}
              </div>

              <div className="min-w-0">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${statusConfig.className}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-2 truncate text-lg font-semibold text-white">
                  {nextTask.title}
                </h3>

                {/* Metadata */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded-md bg-white/5 px-2 py-1 capitalize">
                    {nextTask.category}
                  </span>

                  <span className="text-zinc-700">
                    •
                  </span>

                  <span>
                    {nextTask.startTime}

                    {nextTask.endTime &&
                      ` – ${nextTask.endTime}`}
                  </span>

                  <span className="text-zinc-700">
                    •
                  </span>

                  <span className="capitalize">
                    {nextTask.priority}
                  </span>
                </div>

                {/* Live task progress */}
                {taskStatus === "current" &&
                  nextTask.endTime && (
                    <div className="mt-4 max-w-md">
                      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-600">
                        <span>Progress</span>

                        <span>
                          {Math.round(progress)}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-white transition-all duration-1000"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Countdown / Action */}
            <div className="flex shrink-0 items-center gap-3">
              {taskStatus === "current" ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-3 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-400/60">
                    In progress
                  </p>

                  <p className="mt-1 font-mono text-lg font-semibold text-emerald-400">
                    NOW
                  </p>
                </div>
              ) : taskStatus === "missed" ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-3 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-amber-400/60">
                    Status
                  </p>

                  <p className="mt-1 font-mono text-lg font-semibold text-amber-400">
                    MISSED
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-right sm:min-w-[150px]">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Starts in
                  </p>

                  <p className="mt-1 font-mono text-xl font-semibold text-white">
                    {countdown ?? "--:--"}
                  </p>
                </div>
              )}

              {/* Complete button */}
              {!nextTask.completed &&
                taskStatus !== "missed" && (
                  <button
                    type="button"
                    onClick={() =>
                      toggleTask(nextTask.id)
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-500 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    aria-label="Complete task"
                    title="Complete task"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[130px] items-center justify-between gap-4 p-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-300">
              No upcoming tasks
            </h3>

            <p className="mt-1 text-xs text-zinc-600">
              Your schedule is clear for now.
            </p>
          </div>

          <ArrowRight
            size={18}
            className="text-zinc-700"
          />
        </div>
      )}
    </div>
  );
}