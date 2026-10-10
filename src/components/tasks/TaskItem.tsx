"use client";

import {
  Bell,
  BellOff,
  Check,
  Clock3,
  MoreHorizontal,
  Pencil,
  Target,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScheduler } from "@/hooks/useScheduler";
import { getTaskStatus } from "@/lib/scheduler";
import {
  getTaskFocusStats,
  useFocusStore,
} from "@/store/focusStore";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/types/task";

import AddTaskDialog from "./AddTaskDialog";

interface TaskItemProps {
  task: Task;
}

const priorityStyles = {
  low: "bg-zinc-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export default function TaskItem({
  task,
}: TaskItemProps) {
  const router = useRouter();

  const now = useScheduler();

  const sessionHistory = useFocusStore(
    (state) => state.sessionHistory
  );

  const focusStats = getTaskFocusStats(
    sessionHistory,
    task.id
  );

  const status = now
    ? getTaskStatus(task, now)
    : "upcoming";

  const toggleTask = useTaskStore(
    (state) => state.toggleTask
  );

  const deleteTask = useTaskStore(
    (state) => state.deleteTask
  );

  const updateTask = useTaskStore(
    (state) => state.updateTask
  );

  const [editOpen, setEditOpen] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const alarmEnabled =
    task.alarmEnabled !== false;

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmed) return;

    deleteTask(task.id);
  };

  const handleToggleAlarm = () => {
    updateTask(task.id, {
      alarmEnabled: !alarmEnabled,
    });

    setMenuOpen(false);
  };

  const handleStartFocus = () => {
    router.push(
      `/focus?taskId=${encodeURIComponent(task.id)}`
    );

    setMenuOpen(false);
  };

  return (
    <>
      {/* Task Row */}
      <div
        className={`group relative grid grid-cols-[72px_1fr] gap-4 transition ${
          task.completed
            ? "opacity-50"
            : status === "current"
              ? "scale-[1.01]"
              : ""
        }`}
      >
        {/* Time */}
        <div className="pt-4 text-right text-xs text-zinc-500">
          {task.startTime || "--:--"}
        </div>

        {/* Task Content */}
        <div className="relative pb-3">
          <div
            className={`rounded-2xl border p-4 transition ${
              status === "current"
                ? "border-white/30 bg-white/[0.07] shadow-lg shadow-white/5"
                : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left Content */}
              <div className="flex min-w-0 gap-3">
                {/* Complete Button */}
                <button
                  type="button"
                  onClick={() =>
                    toggleTask(task.id)
                  }
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                    task.completed
                      ? "border-white bg-white text-black"
                      : "border-white/20 hover:border-white/50"
                  }`}
                  title={
                    task.completed
                      ? "Mark incomplete"
                      : "Mark complete"
                  }
                >
                  {task.completed && (
                    <Check size={13} />
                  )}
                </button>

                {/* Task Information */}
                <div className="min-w-0">
                  {/* Current Task */}
                  {status === "current" && (
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      Now
                    </div>
                  )}

                  {/* Upcoming */}
                  {status === "upcoming" &&
                    task.startTime && (
                      <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Upcoming
                      </div>
                    )}

                  {/* Task Title */}
                  <h4
                    className={`text-sm font-medium ${
                      task.completed
                        ? "text-zinc-500 line-through"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </h4>

                  {/* Description */}
                  {task.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-zinc-600">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {/* Category */}
                    <span className="rounded-md bg-white/5 px-2 py-1 text-zinc-500">
                      {task.category}
                    </span>

                    <span className="text-zinc-700">
                      •
                    </span>

                    {/* Time */}
                    <span className="text-zinc-500">
                      {task.startTime || "--:--"}

                      {task.endTime &&
                        ` – ${task.endTime}`}
                    </span>

                    <span className="text-zinc-700">
                      •
                    </span>

                    {/* Priority */}
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          priorityStyles[
                            task.priority
                          ]
                        }`}
                      />

                      {task.priority}
                    </span>

                    {/* Focus Sessions */}
                    {focusStats && (
                      <>
                        <span className="text-zinc-700">
                          •
                        </span>

                        <span className="flex items-center gap-1 text-zinc-500">
                          <Clock3 size={12} />

                          {focusStats.sessions}{" "}
                          {focusStats.sessions === 1
                            ? "session"
                            : "sessions"}
                        </span>
                      </>
                    )}

                    {/* Alarm */}
                    {task.startTime && (
                      <>
                        <span className="text-zinc-700">
                          •
                        </span>

                        <span
                          className={`flex items-center gap-1 ${
                            alarmEnabled
                              ? "text-zinc-500"
                              : "text-zinc-700"
                          }`}
                        >
                          {alarmEnabled ? (
                            <Bell size={12} />
                          ) : (
                            <BellOff size={12} />
                          )}

                          {alarmEnabled
                            ? "Alarm on"
                            : "Alarm off"}
                        </span>
                      </>
                    )}

                    {/* Missed */}
                    {status === "missed" &&
                      !task.completed && (
                        <>
                          <span className="text-zinc-700">
                            •
                          </span>

                          <span className="font-medium text-red-400">
                            missed
                          </span>
                        </>
                      )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="relative flex shrink-0 items-center gap-1">
                {/* Edit */}
                <button
                  type="button"
                  onClick={() =>
                    setEditOpen(true)
                  }
                  className="rounded-lg p-2 text-zinc-700 opacity-0 transition hover:bg-white/5 hover:text-white group-hover:opacity-100"
                  title="Edit task"
                >
                  <Pencil size={15} />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-lg p-2 text-zinc-700 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                  title="Delete task"
                >
                  <Trash2 size={15} />
                </button>

                {/* More */}
                <button
                  type="button"
                  onClick={() =>
                    setMenuOpen(
                      (open) => !open
                    )
                  }
                  className="rounded-lg p-2 text-zinc-700 opacity-0 transition hover:bg-white/5 hover:text-white group-hover:opacity-100"
                  title="More options"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} />
                </button>

                {/* More Menu */}
                {menuOpen && (
                  <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#151518] p-1 shadow-2xl">
                    {/* Start Focus */}
                    <button
                      type="button"
                      onClick={handleStartFocus}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    >
                      <Target size={14} />
                      Start Focus
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditOpen(true);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    >
                      <Pencil size={14} />
                      Edit task
                    </button>

                    {/* Alarm */}
                    {task.startTime && (
                      <button
                        type="button"
                        onClick={
                          handleToggleAlarm
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      >
                        {alarmEnabled ? (
                          <BellOff size={14} />
                        ) : (
                          <Bell size={14} />
                        )}

                        {alarmEnabled
                          ? "Disable alarm"
                          : "Enable alarm"}
                      </button>
                    )}

                    {/* Complete */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleTask(task.id);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    >
                      <Check size={14} />

                      {task.completed
                        ? "Mark incomplete"
                        : "Mark complete"}
                    </button>

                    <div className="my-1 border-t border-white/5" />

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        handleDelete();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                      Delete task
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editOpen && (
        <AddTaskDialog
          editTask={task}
          onClose={() =>
            setEditOpen(false)
          }
        />
      )}
    </>
  );
}