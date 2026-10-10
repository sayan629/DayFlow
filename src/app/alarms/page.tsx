"use client";

import AlarmList from "@/components/alarms/AlarmList";
import AlarmHistory from "@/components/alarms/AlarmHistory";

export default function AlarmsPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1500px] p-5 md:p-8">
              <div className="mb-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                  Workspace
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                  Alarms
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Manage your upcoming reminders and alarms.
                </p>
              </div>

              {/* Today's alarms */}
              <AlarmList />

              {/* Alarm history */}
              <div className="mt-6">
                <AlarmHistory />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}