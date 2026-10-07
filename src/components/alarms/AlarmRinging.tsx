"use client";

import { BellRing, Square } from "lucide-react";
import { useAlarmStore } from "@/store/alarmStore";

export default function AlarmRinging() {
  const isRinging = useAlarmStore((state) => state.isRinging);
  const taskTitle = useAlarmStore((state) => state.taskTitle);
  const stopAlarm = useAlarmStore((state) => state.stopAlarm);

  if (!isRinging) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111114] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-white text-black">
          <BellRing size={28} />
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Alarm
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-white">
          {taskTitle}
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Your scheduled task is starting now.
        </p>

        <button
          type="button"
          onClick={stopAlarm}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          <Square size={16} />
          Stop Alarm
        </button>
      </div>
    </div>
  );
}