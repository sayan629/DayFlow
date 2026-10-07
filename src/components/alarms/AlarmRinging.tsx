"use client";

import { BellRing, Moon, Square } from "lucide-react";
import { useAlarmStore } from "@/store/alarmStore";

export default function AlarmRinging() {
  const isRinging = useAlarmStore((state) => state.isRinging);
  const taskTitle = useAlarmStore((state) => state.taskTitle);

  const stopAlarm = useAlarmStore((state) => state.stopAlarm);
  const snoozeAlarm = useAlarmStore((state) => state.snoozeAlarm);

  if (!isRinging) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111114] shadow-2xl">

        {/* Header */}
        <div className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-white text-black">
            <BellRing size={28} />
          </div>

          <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
            Alarm
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            {taskTitle}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Your scheduled task is starting now.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 border-t border-white/10 bg-white/[0.02] p-6">

          {/* Snooze */}
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

          {/* Stop */}
          <button
            type="button"
            onClick={stopAlarm}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            <Square size={16} />
            Stop Alarm
          </button>
        </div>
      </div>
    </div>
  );
}