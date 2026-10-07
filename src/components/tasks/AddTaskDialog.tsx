"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import { useTaskStore } from "@/store/taskStore";
import {
  Task,
  TaskCategory,
  TaskPriority,
} from "@/types/task";

interface AddTaskDialogProps {
  editTask?: Task;
  onClose?: () => void;
}

export default function AddTaskDialog({
  editTask,
  onClose,
}: AddTaskDialogProps) {
  const addTask = useTaskStore(
    (state) => state.addTask
  );

  const updateTask = useTaskStore(
    (state) => state.updateTask
  );

  const [open, setOpen] = useState(!!editTask);

  const [title, setTitle] = useState(
    editTask?.title ?? ""
  );

  const [description, setDescription] = useState(
    editTask?.description ?? ""
  );

  const [date, setDate] = useState(
    editTask?.date ?? ""
  );

  const [startTime, setStartTime] = useState(
    editTask?.startTime ?? ""
  );

  const [endTime, setEndTime] = useState(
    editTask?.endTime ?? ""
  );

  const [priority, setPriority] =
    useState<TaskPriority>(
      editTask?.priority ?? "medium"
    );

  const [category, setCategory] =
    useState<TaskCategory>(
      editTask?.category ?? "development"
    );

  const [reminder, setReminder] =
    useState<number>(
      editTask?.reminder ?? 10
    );

  useEffect(() => {
    if (!editTask) {
      setDate(getToday());
    }
  }, [editTask]);

  const getToday = () => {
    return new Date()
      .toISOString()
      .split("T")[0];
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(getToday());
    setStartTime("");
    setEndTime("");
    setPriority("medium");
    setCategory("development");
    setReminder(10);
  };

  const closeDialog = () => {
    if (editTask) {
      onClose?.();
      return;
    }

    resetForm();
    setOpen(false);
  };

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    if (editTask) {
      updateTask(editTask.id, {
        title: title.trim(),
        description: description.trim(),
        date,
        startTime,
        endTime,
        priority,
        category,
        reminder,
      });

      onClose?.();
      setOpen(false);

      return;
    }

    addTask({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      priority,
      category,
      reminder,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    resetForm();
    setOpen(false);
  };

  return (
    <>
      {!editTask && (
        <button
          type="button"
          onClick={() => {
            setDate(getToday());
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          <Plus size={17} />
          Add Task
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111114] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {editTask
                    ? "Edit Task"
                    : "Create Task"}
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  {editTask
                    ? "Update your task details."
                    : "Add something you want to accomplish."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Task title
                </label>

                <input
                  autoFocus
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. Complete LeetCode problems"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Add some details..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600"
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Start time
                  </label>

                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) =>
                      setStartTime(e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    End time
                  </label>

                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) =>
                      setEndTime(e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Priority + Category */}
              <div className="grid grid-cols-2 gap-3">
                {/* Priority */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(
                        e.target
                          .value as TaskPriority
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target
                          .value as TaskCategory
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  >
                    <option value="study">
                      Study
                    </option>

                    <option value="development">
                      Development
                    </option>

                    <option value="personal">
                      Personal
                    </option>

                    <option value="fitness">
                      Fitness
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              {/* Reminder */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Reminder
                </label>

                <select
                  value={reminder}
                  onChange={(e) =>
                    setReminder(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value={0}>
                    At start time
                  </option>

                  <option value={1}>
                    1 minute before
                  </option>

                  <option value={5}>
                    5 minutes before
                  </option>

                  <option value={10}>
                    10 minutes before
                  </option>

                  <option value={15}>
                    15 minutes before
                  </option>

                  <option value={30}>
                    30 minutes before
                  </option>

                  <option value={60}>
                    1 hour before
                  </option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  {editTask
                    ? "Save Changes"
                    : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}