"use client";

import {
  Bell,
  CheckCircle2,
  Clock3,
  History,
  Trash2,
  Timer,
} from "lucide-react";

import { useAlarmStore } from "@/store/alarmStore";
import { useScheduler } from "@/hooks/useScheduler";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getDurationMinutes(
  triggeredAt: string,
  stoppedAt?: string
) {
  if (!stoppedAt) return null;

  const start = new Date(triggeredAt).getTime();
  const end = new Date(stoppedAt).getTime();

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    end < start
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.round((end - start) / 60000)
  );
}

function formatDuration(minutes: number | null) {
  if (minutes === null) return null;

  if (minutes < 1) {
    return "< 1 min";
  }

  if (minutes === 1) {
    return "1 min";
  }

  return `${minutes} min`;
}

export default function AlarmHistory() {
  const now = useScheduler();
  const history = useAlarmStore(
    (state) => state.history
  );

  const clearHistory = useAlarmStore(
    (state) => state.clearHistory
  );

  const stoppedCount = history.filter(
    (alarm) => alarm.status === "stopped"
  ).length;

  const snoozedCount = history.filter(
    (alarm) => alarm.status === "snoozed"
  ).length;

  const responseTimes = history
    .filter((alarm) => alarm.status === "stopped")
    .map((alarm) =>
      getDurationMinutes(
        alarm.triggeredAt,
        alarm.stoppedAt
      )
    )
    .filter(
      (value): value is number => value !== null
    );

  const averageResponse =
    responseTimes.length > 0
      ? Math.round(
          responseTimes.reduce(
            (total, value) => total + value,
            0
          ) / responseTimes.length
        )
      : null;

  const fastestResponse =
    responseTimes.length > 0
      ? Math.min(...responseTimes)
      : null;

  const slowestResponse =
    responseTimes.length > 0
      ? Math.max(...responseTimes)
      : null;

  const todayStart = now
  ? new Date(now.getTime())
  : null;

if (todayStart) {
  todayStart.setHours(0, 0, 0, 0);
}

  const todayHistory = todayStart
  ? history.filter(
      (item) =>
        new Date(item.triggeredAt) >= todayStart
    )
  : [];

  const todayStoppedCount = todayHistory.filter(
    (alarm) => alarm.status === "stopped"
  ).length;

  const todaySnoozedCount = todayHistory.filter(
    (alarm) => alarm.status === "snoozed"
  ).length;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
            <History size={18} />
          </div>

          <div>
            <h2 className="font-semibold">
              Alarm History
            </h2>

            <p className="text-xs text-zinc-500">
              Recent alarm activity
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Statistics */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 gap-3 border-b border-white/10 p-5 md:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Total
            </p>

            <p className="mt-2 text-2xl font-semibold text-white">
              {history.length}
            </p>

            <p className="mt-1 text-[10px] text-zinc-600">
              All time
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Stopped
            </p>

            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {stoppedCount}
            </p>

            <p className="mt-1 text-[10px] text-zinc-600">
              Completed alarms
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Snoozed
            </p>

            <p className="mt-2 text-2xl font-semibold text-amber-400">
              {snoozedCount}
            </p>

            <p className="mt-1 text-[10px] text-zinc-600">
              Deferred alarms
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Today
            </p>

            <p className="mt-2 text-2xl font-semibold text-white">
              {todayHistory.length}
            </p>

            <p className="mt-1 text-[10px] text-zinc-600">
              {todayStoppedCount} stopped ·{" "}
              {todaySnoozedCount} snoozed
            </p>
          </div>
        </div>
      )}

      {/* Response Analytics */}
      {responseTimes.length > 0 && (
        <div className="grid grid-cols-1 gap-3 border-b border-white/10 p-5 md:grid-cols-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2">
              <Timer
                size={14}
                className="text-zinc-500"
              />

              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                Average Response
              </p>
            </div>

            <p className="mt-2 text-xl font-semibold text-white">
              {formatDuration(averageResponse)}
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2">
              <Clock3
                size={14}
                className="text-emerald-400"
              />

              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                Fastest Response
              </p>
            </div>

            <p className="mt-2 text-xl font-semibold text-emerald-400">
              {formatDuration(fastestResponse)}
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2">
              <Clock3
                size={14}
                className="text-amber-400"
              />

              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                Slowest Response
              </p>
            </div>

            <p className="mt-2 text-xl font-semibold text-amber-400">
              {formatDuration(slowestResponse)}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <Bell
              size={20}
              className="text-zinc-500"
            />
          </div>

          <p className="text-sm font-medium text-zinc-300">
            No alarm history
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Triggered alarms will appear here.
          </p>
        </div>
      ) : (
        /* History List */
        <div className="divide-y divide-white/5">
          {history.map((alarm) => {
            const isSnoozed =
              alarm.status === "snoozed";

            const responseTime =
              getDurationMinutes(
                alarm.triggeredAt,
                alarm.stoppedAt
              );

            return (
              <div
                key={alarm.id}
                className="flex items-center justify-between gap-4 p-5 transition hover:bg-white/[0.02]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isSnoozed
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {isSnoozed ? (
                      <Clock3 size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {alarm.taskTitle}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Triggered{" "}
                      {formatDateTime(
                        alarm.triggeredAt
                      )}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
                      isSnoozed
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {isSnoozed
                      ? "Snoozed"
                      : "Stopped"}
                  </span>

                  <p className="mt-1 text-[10px] text-zinc-600">
                    {isSnoozed
                      ? alarm.snoozedUntil
                        ? `Until ${formatDateTime(
                            alarm.snoozedUntil
                          )}`
                        : "Snoozed"
                      : alarm.stoppedAt
                        ? `Stopped ${formatDateTime(
                            alarm.stoppedAt
                          )}`
                        : ""}
                  </p>

                  {!isSnoozed &&
                    responseTime !== null && (
                      <p className="mt-1 text-[10px] text-zinc-500">
                        Response:{" "}
                        {formatDuration(
                          responseTime
                        )}
                      </p>
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