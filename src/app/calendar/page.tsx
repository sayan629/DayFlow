"use client";

import CalendarView from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Calendar Content */}
          <div className="flex-1 overflow-y-auto">
            <main className="min-h-full p-5 md:p-8">
              <div className="mx-auto max-w-[1500px]">
                <CalendarView />
              </div>
            </main>
          </div>
        </section>
      </div>
    </main>
  );
}