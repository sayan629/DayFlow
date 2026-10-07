"use client";

import CalendarView from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-[#09090b] p-6 text-white md:p-8">
      <div className="mx-auto max-w-7xl">
        <CalendarView />
      </div>
    </main>
  );
}