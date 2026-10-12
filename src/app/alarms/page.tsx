"use client";

import { ArrowLeft, BellRing } from "lucide-react";
import { useRouter } from "next/navigation";

import AlarmHistory from "@/components/alarms/AlarmHistory";

export default function AlarmsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-[1500px] p-5 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <BellRing size={20} className="text-zinc-300" />

                <h1 className="text-2xl font-semibold tracking-tight">
                  Alarm History
                </h1>
              </div>

              <p className="mt-1 text-sm text-zinc-500">
                Review your recent alarms, snoozes, and responses.
              </p>
            </div>
          </div>
        </div>

        {/* Alarm History */}
        <AlarmHistory />
      </div>
    </main>
  );
}