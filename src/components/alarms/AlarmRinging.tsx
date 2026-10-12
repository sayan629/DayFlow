"use client";

import {
  BellRing,
  ListChecks,
  Moon,
  Play,
  Square,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useAlarmStore } from "@/store/alarmStore";

export default function AlarmRinging() {
  const router = useRouter();

  const isRinging = useAlarmStore(
    (state) => state.isRinging
  );

  const taskId = useAlarmStore(
    (state) => state.taskId
  );

  const taskTitle = useAlarmStore(
    (state) => state.taskTitle
  );

  const queue = useAlarmStore(
    (state) => state.queue
  );

  const stopAlarm = useAlarmStore(
    (state) => state.stopAlarm
  );

  const stopAlarmWithoutAdvancing =
    useAlarmStore(
      (state) => state.stopAlarmWithoutAdvancing
    );

  const snoozeAlarm = useAlarmStore(
    (state) => state.snoozeAlarm
  );

  if (!isRinging) {
    return null;
  }

  const handleStartFocus = () => {
    if (!taskId) {
      return;
    }

    stopAlarmWithoutAdvancing();

    router.push(
      `/focus?taskId=${encodeURIComponent(
        taskId
      )}`
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111114] shadow-2xl">
        <div className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-white text-black">
            <BellRing size={28} />
          </div>

          <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
            Alarm
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            {taskTitle ?? "Scheduled Task"}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Your scheduled task is starting now.
          </p>
        </div>

        {queue.length > 0 && (
          <div className="mx-6 mb-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <ListChecks
                size={16}
                className="text-zinc-400"
              />

              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                {queue.length}{" "}
                {queue.length === 1
                  ? "alarm"
                  : "alarms"}{" "}
                waiting
              </span>
            </div>

            <div className="max-h-32 overflow-y-auto p-2">
              {queue.map((alarm, index) => (
                <div
                  key={`${alarm.taskId}-${index}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[11px] text-zinc-500">
                    {index + 1}
                  </span>

                  <span className="truncate">
                    {alarm.taskTitle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 border-t border-white/10 bg-white/[0.02] p-6">
          <button
            type="button"
            onClick={handleStartFocus}
            disabled={!taskId}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play size={16} />
            Start Focus
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => snoozeAlarm(5)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Moon size={16} />
              Snooze 5 min
            </button>

            <button
              type="button"
              onClick={() => snoozeAlarm(10)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Moon size={16} />
              Snooze 10 min
            </button>
          </div>

          <button
            type="button"
            onClick={stopAlarm}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Square size={16} />
            Stop Alarm
          </button>
        </div>
      </div>
    </div>
  );
}