"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pencil,
  Plus,
  Trash2,
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

import { useMemo, useState } from "react";

import { useTaskStore } from "@/store/taskStore";
import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import { useScheduler } from "@/hooks/useScheduler";

export default function CalendarView() {
  const tasks = useTaskStore((state) => state.tasks);

  const toggleTask = useTaskStore(
    (state) => state.toggleTask
  );

  const deleteTask = useTaskStore(
    (state) => state.deleteTask
  );

  /*
   * useScheduler provides the current time after mount.
   * This avoids new Date() during prerender.
   */
  const now = useScheduler();

  const [monthOffset, setMonthOffset] =
    useState(0);

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [addTaskOpen, setAddTaskOpen] =
    useState(false);

  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);

  /*
   * Hooks MUST always execute in the same order.
   * Therefore all useMemo calls stay before any return.
   */
  const currentMonth = useMemo(() => {
    if (!now) return null;

    return addMonths(now, monthOffset);
  }, [now, monthOffset]);

  const activeSelectedDate = useMemo(() => {
    if (selectedDate) {
      return selectedDate;
    }

    return now;
  }, [selectedDate, now]);

  const calendarDays = useMemo(() => {
    if (!currentMonth) {
      return [];
    }

    return eachDayOfInterval({
      start: startOfWeek(
        startOfMonth(currentMonth),
        {
          weekStartsOn: 1,
        }
      ),
      end: endOfWeek(
        endOfMonth(currentMonth),
        {
          weekStartsOn: 1,
        }
      ),
    });
  }, [currentMonth]);

  const selectedTasks = useMemo(() => {
    if (!activeSelectedDate) {
      return [];
    }

    return tasks
      .filter((task) => {
        const taskDate = new Date(
          `${task.date}T00:00:00`
        );

        return isSameDay(
          taskDate,
          activeSelectedDate
        );
      })
      .sort((a, b) =>
        (a.startTime ?? "").localeCompare(
          b.startTime ?? ""
        )
      );
  }, [tasks, activeSelectedDate]);

  const editingTask = useMemo(() => {
    if (!editingTaskId) {
      return null;
    }

    return (
      tasks.find(
        (task) => task.id === editingTaskId
      ) ?? null
    );
  }, [tasks, editingTaskId]);

  const previousMonth = () => {
    setMonthOffset((offset) => offset - 1);
  };

  const nextMonth = () => {
    setMonthOffset((offset) => offset + 1);
  };

  const goToToday = () => {
    if (!now) return;

    setMonthOffset(0);
    setSelectedDate(now);
  };

  const handleDelete = (
    taskId: string,
    title: string
  ) => {
    const confirmed = window.confirm(
      `Delete "${title}"?`
    );

    if (!confirmed) {
      return;
    }

    deleteTask(taskId);
  };

  /*
   * Scheduler has not produced the current time yet.
   * All hooks have already executed above.
   */
  if (!now || !currentMonth || !activeSelectedDate) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
            Calendar
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-white">
            {format(
              currentMonth,
              "MMMM yyyy"
            )}
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
            aria-label="Previous month"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="rounded-xl border border-white/10 p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Next month"
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
            const dayTasks = tasks.filter(
              (task) => {
                const taskDate = new Date(
                  `${task.date}T00:00:00`
                );

                return isSameDay(
                  taskDate,
                  day
                );
              }
            );

            const selected = isSameDay(
              day,
              activeSelectedDate
            );

            /*
             * Use the scheduler's current time.
             * Do NOT use new Date() here.
             */
            const today =
              isSameDay(day, now) &&
              isSameMonth(day, currentMonth);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() =>
                  setSelectedDate(day)
                }
                className={`min-h-[105px] border-b border-r border-white/5 p-2 text-left transition hover:bg-white/[0.04] ${
                  !isSameMonth(
                    day,
                    currentMonth
                  )
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
                        className="flex items-center gap-1 truncate rounded-md bg-white/5 px-2 py-1 text-[10px]"
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            task.completed
                              ? "bg-zinc-700"
                              : task.priority ===
                                  "high"
                                ? "bg-red-400"
                                : task.priority ===
                                    "medium"
                                  ? "bg-yellow-400"
                                  : "bg-zinc-500"
                          }`}
                        />

                        {task.startTime && (
                          <span className="mr-1 shrink-0 text-zinc-600">
                            {task.startTime}
                          </span>
                        )}

                        <span
                          className={`truncate ${
                            task.completed
                              ? "text-zinc-700 line-through"
                              : "text-zinc-500"
                          }`}
                        >
                          {task.title}
                        </span>
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

      {/* Selected Date */}
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              Selected day
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              {format(
                activeSelectedDate,
                "EEEE, MMMM d"
              )}
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              setAddTaskOpen(true)
            }
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-zinc-200"
          >
            <Plus size={15} />
            Add Task
          </button>
        </div>

        <div className="p-5">
          {selectedTasks.length === 0 ? (
            <div className="flex min-h-[120px] flex-col items-center justify-center text-center">
              <p className="text-sm text-zinc-600">
                No tasks scheduled for this
                day.
              </p>

              <button
                type="button"
                onClick={() =>
                  setAddTaskOpen(true)
                }
                className="mt-3 text-xs text-zinc-400 underline underline-offset-4 transition hover:text-white"
              >
                Create a task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleTask(task.id)
                    }
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                      task.completed
                        ? "border-white bg-white text-black"
                        : "border-white/10 text-transparent hover:border-white/30"
                    }`}
                    title={
                      task.completed
                        ? "Mark incomplete"
                        : "Mark complete"
                    }
                  >
                    <Check size={16} />
                  </button>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <Clock3
                      size={17}
                      className="text-zinc-500"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
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

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingTaskId(
                          task.id
                        )
                      }
                      className="rounded-lg p-2 text-zinc-600 transition hover:bg-white/5 hover:text-white"
                      title="Edit task"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          task.id,
                          task.title
                        )
                      }
                      className="rounded-lg p-2 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                      title="Delete task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add Task Dialog */}
      {addTaskOpen && (
        <AddTaskDialog
          defaultDate={format(
            activeSelectedDate,
            "yyyy-MM-dd"
          )}
          onClose={() =>
            setAddTaskOpen(false)
          }
        />
      )}

      {/* Edit Task Dialog */}
      {editingTask && (
        <AddTaskDialog
          editTask={editingTask}
          onClose={() =>
            setEditingTaskId(null)
          }
        />
      )}
    </div>
  );
}