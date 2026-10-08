"use client";

import {
  Bell,
  CheckCircle2,
  Clock3,
  History,
  Trash2,
} from "lucide-react";

import { useAlarmStore } from "@/store/alarmStore";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AlarmHistory() {
  const history = useAlarmStore((state) => state.history);
  const clearHistory = useAlarmStore(
    (state) => state.clearHistory
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
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

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <Bell size={20} className="text-zinc-500" />
          </div>

          <p className="text-sm font-medium text-zinc-300">
            No alarm history
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Triggered alarms will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {history.map((alarm) => {
            const isSnoozed = alarm.status === "snoozed";

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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}