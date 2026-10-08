"use client";

import {
  ArrowRight,
  Clock3,
  ListTodo,
} from "lucide-react";
import { useMemo } from "react";

import { useScheduler } from "@/hooks/useScheduler";
import {
  getNextTask,
  getTaskStatus,
} from "@/lib/scheduler";
import { useTaskStore } from "@/store/taskStore";

export default function NextTaskCard() {
  const now = useScheduler();

  const tasks = useTaskStore((state) => state.tasks);

  const nextTask = useMemo(() => {
    if (!now) {
      return null;
    }

    return getNextTask(tasks);
  }, [tasks, now]);

  const taskStatus = useMemo(() => {
  if (!nextTask || !now) {
    return null;
  }

  return getTaskStatus(nextTask);
}, [nextTask, now]);

  const countdown = useMemo(() => {
    if (!nextTask?.startTime || !now) {
      return null;
    }

    const [hours, minutes] = nextTask.startTime
      .split(":")
      .map(Number);

    const taskTime = new Date();

    taskTime.setHours(
      hours,
      minutes,
      0,
      0
    );

    const difference =
      taskTime.getTime() - now.getTime();

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

  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
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
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <ListTodo
                  size={19}
                  className="text-zinc-400"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                 <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
  {taskStatus === "current"
    ? "Current"
    : taskStatus === "missed"
      ? "Missed"
      : "Upcoming"}
</span>
                </div>

                <h3 className="mt-1 truncate text-lg font-semibold text-white">
                  {nextTask.title}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded-md bg-white/5 px-2 py-1">
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
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 sm:min-w-[150px] sm:text-right">
              <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                Starts in
              </p>

              <p className="mt-1 font-mono text-xl font-semibold text-white">
                {countdown ?? "--:--"}
              </p>
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