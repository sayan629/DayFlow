"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";

export default function CalendarView() {
  const tasks = useTaskStore((state) => state.tasks);

  // IMPORTANT:
  // Do not initialize state with new Date().
  const [currentMonth, setCurrentMonth] =
    useState<Date | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  // Set current date only after the component mounts
  useEffect(() => {
    const today = new Date();

    setCurrentMonth(today);
    setSelectedDate(today);
  }, []);

  const calendarDays = useMemo(() => {
    if (!currentMonth) return [];

    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentMonth), {
        weekStartsOn: 1,
      }),
      end: endOfWeek(endOfMonth(currentMonth), {
        weekStartsOn: 1,
      }),
    });
  }, [currentMonth]);

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return [];

    return tasks
      .filter((task) => {
        const taskDate = new Date(
          `${task.date}T00:00:00`
        );

        return isSameDay(taskDate, selectedDate);
      })
      .sort((a, b) =>
        (a.startTime ?? "").localeCompare(
          b.startTime ?? ""
        )
      );
  }, [tasks, selectedDate]);

  const previousMonth = () => {
    if (!currentMonth) return;

    setCurrentMonth(
      addMonths(currentMonth, -1)
    );
  };

  const nextMonth = () => {
    if (!currentMonth) return;

    setCurrentMonth(
      addMonths(currentMonth, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();

    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Prevent rendering date-dependent UI before hydration
  if (!currentMonth || !selectedDate) {
    return (
      <div className="space-y-6">
        <div className="h-16 animate-pulse rounded-2xl bg-white/[0.03]" />
        <div className="h-[500px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.02]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Calendar header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
            Calendar
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-white">
            {format(currentMonth, "MMMM yyyy")}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Today
          </button>

          <button
            type="button"
            onClick={previousMonth}
            className="rounded-xl border border-white/10 p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="rounded-xl border border-white/10 p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">

        {/* Weekdays */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {[
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
          ].map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dayTasks = tasks.filter((task) => {
              const taskDate = new Date(
                `${task.date}T00:00:00`
              );

              return isSameDay(taskDate, day);
            });

            const selected = isSameDay(
              day,
              selectedDate
            );

            /*
             * IMPORTANT:
             * Don't use new Date() during render.
             * Compare against selected/current month instead.
             */
            const today =
              isSameDay(day, selectedDate) &&
              isSameDay(
                day,
                currentMonth
              );

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={`min-h-[105px] border-b border-r border-white/5 p-2 text-left transition hover:bg-white/[0.04] ${
                  !isSameMonth(day, currentMonth)
                    ? "opacity-30"
                    : ""
                } ${
                  selected
                    ? "bg-white/[0.06]"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${
                      today
                        ? "bg-white font-semibold text-black"
                        : "text-zinc-400"
                    }`}
                  >
                    {format(day, "d")}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-zinc-600">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  {dayTasks
                    .slice(0, 2)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="truncate rounded-md bg-white/5 px-2 py-1 text-[10px] text-zinc-500"
                      >
                        {task.startTime && (
                          <span className="mr-1 text-zinc-600">
                            {task.startTime}
                          </span>
                        )}

                        {task.title}
                      </div>
                    ))}

                  {dayTasks.length > 2 && (
                    <div className="px-2 text-[10px] text-zinc-700">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date */}
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">

        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Selected day
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            {format(
              selectedDate,
              "EEEE, MMMM d"
            )}
          </h2>
        </div>

        <div className="p-5">
          {selectedTasks.length === 0 ? (
            <div className="flex min-h-[120px] items-center justify-center text-sm text-zinc-600">
              No tasks scheduled for this day.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <Clock3
                      size={17}
                      className="text-zinc-500"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`text-sm font-medium ${
                        task.completed
                          ? "text-zinc-600 line-through"
                          : "text-white"
                      }`}
                    >
                      {task.title}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-600">
                      {task.startTime ?? "--:--"}
                      {task.endTime &&
                        ` – ${task.endTime}`}
                      {" • "}
                      {task.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}