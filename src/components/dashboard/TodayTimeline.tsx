"use client";

import {
  CheckCircle2,
  Circle,
  Clock3,
} from "lucide-react";
import { useMemo } from "react";

import { useScheduler } from "@/hooks/useScheduler";
import {
  getTaskProgress,
  getTaskStatus,
} from "@/lib/scheduler";
import { useTaskStore } from "@/store/taskStore";

export default function TodayTimeline() {
  const now = useScheduler();

  const tasks = useTaskStore(
    (state) => state.tasks
  );

  const toggleTask = useTaskStore(
    (state) => state.toggleTask
  );

  const todayTasks = useMemo(() => {
    if (!now) {
      return [];
    }

    const today = now
      .toISOString()
      .split("T")[0];

    return tasks
      .filter(
        (task) =>
          task.date === today &&
          task.startTime
      )
      .sort((a, b) =>
        (a.startTime ?? "").localeCompare(
          b.startTime ?? ""
        )
      );
  }, [tasks, now]);

  if (!now) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h2 className="font-semibold">
            Today&apos;s Timeline
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Your schedule for today
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Clock3
            size={17}
            className="text-zinc-500"
          />
        </div>
      </div>

      {todayTasks.length === 0 ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <div className="text-center">
            <Clock3
              size={24}
              className="mx-auto text-zinc-600"
            />

            <p className="mt-3 text-sm text-zinc-400">
              No scheduled tasks today
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Add a task with a start time to build
              your timeline.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {todayTasks.map((task) => {
            const status =
              getTaskStatus(task, now);

            const progress =
              getTaskProgress(task, now);

            return (
              <div
                key={task.id}
                className={`group relative flex gap-5 px-6 py-5 transition ${
                  status === "current"
                    ? "bg-white/[0.025]"
                    : "hover:bg-white/[0.015]"
                }`}
              >
                {/* Time */}
                <div className="w-20 shrink-0 pt-1">
                  <p
                    className={`font-mono text-sm font-medium ${
                      status === "current"
                        ? "text-white"
                        : "text-zinc-400"
                    }`}
                  >
                    {formatTime(
                      task.startTime!
                    )}
                  </p>

                  {task.endTime && (
                    <p className="mt-1 text-[10px] text-zinc-600">
                      {formatTime(
                        task.endTime
                      )}
                    </p>
                  )}
                </div>

                {/* Timeline indicator */}
                <div className="relative flex w-5 shrink-0 justify-center">
                  <div className="absolute inset-y-0 w-px bg-white/10" />

                  <div className="relative z-10 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0c0c0f]">
                    {status === "completed" ? (
                      <CheckCircle2
                        size={17}
                        className="text-emerald-400"
                      />
                    ) : status === "current" ? (
                      <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
                    ) : (
                      <Circle
                        size={14}
                        className="text-zinc-600"
                      />
                    )}
                  </div>
                </div>

                {/* Task */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`truncate text-sm font-medium ${
                            task.completed
                              ? "text-zinc-500 line-through"
                              : "text-zinc-200"
                          }`}
                        >
                          {task.title}
                        </h3>

                        {status === "current" && (
                          <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                            Current
                          </span>
                        )}

                        {status === "missed" && (
                          <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-400">
                            Missed
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
                        <span className="capitalize">
                          {task.category}
                        </span>

                        <span>•</span>

                        <span className="capitalize">
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {!task.completed && (
                      <button
                        type="button"
                        onClick={() =>
                          toggleTask(task.id)
                        }
                        className="shrink-0 rounded-lg p-1.5 text-zinc-600 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
                        aria-label="Complete task"
                        title="Complete task"
                      >
                        <CheckCircle2
                          size={17}
                        />
                      </button>
                    )}
                  </div>

                  {/* Current task progress */}
                  {status === "current" &&
                    task.endTime && (
                      <div className="mt-4 max-w-lg">
                        <div className="mb-1.5 flex justify-between text-[9px] uppercase tracking-wider text-zinc-600">
                          <span>
                            In progress
                          </span>

                          <span>
                            {Math.round(
                              progress
                            )}
                            %
                          </span>
                        </div>

                        <div className="h-1 overflow-hidden rounded-full bg-white/10">
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
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatTime(time: string) {
  const [hours, minutes] =
    time.split(":").map(Number);

  const period =
    hours >= 12 ? "PM" : "AM";

  const displayHours =
    hours % 12 || 12;

  return `${displayHours}:${String(
    minutes
  ).padStart(2, "0")} ${period}`;
}