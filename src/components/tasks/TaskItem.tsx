"use client";

import { Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

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

export default function TaskItem({ task }: TaskItemProps) {
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div
        className={`group relative grid grid-cols-[72px_1fr] gap-4 transition ${
          task.completed ? "opacity-50" : ""
        }`}
      >
        {/* Time */}
        <div className="pt-4 text-right text-xs text-zinc-500">
          {task.startTime || "--:--"}
        </div>

        {/* Task */}
        <div className="relative pb-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.04]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                {/* Complete */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                    task.completed
                      ? "border-white bg-white text-black"
                      : "border-white/20 hover:border-white/50"
                  }`}
                >
                  {task.completed && <Check size={13} />}
                </button>

                <div className="min-w-0">
                  {/* Title */}
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
                    <span className="rounded-md bg-white/5 px-2 py-1 text-zinc-500">
                      {task.category}
                    </span>

                    <span className="text-zinc-700">•</span>

                    <span className="text-zinc-500">
                      {task.startTime || "--:--"}
                      {task.endTime && ` – ${task.endTime}`}
                    </span>

                    <span className="text-zinc-700">•</span>

                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          priorityStyles[task.priority]
                        }`}
                      />

                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Edit */}
                <button
                  onClick={() => setEditOpen(true)}
                  className="rounded-lg p-2 text-zinc-700 opacity-0 transition hover:bg-white/5 hover:text-white group-hover:opacity-100"
                  title="Edit task"
                >
                  <Pencil size={15} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="rounded-lg p-2 text-zinc-700 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                  title="Delete task"
                >
                  <Trash2 size={15} />
                </button>

                {/* More */}
                <button
                  className="rounded-lg p-2 text-zinc-700 opacity-0 transition hover:bg-white/5 hover:text-white group-hover:opacity-100"
                  title="More"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      {editOpen && (
        <AddTaskDialog
          editTask={task}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}