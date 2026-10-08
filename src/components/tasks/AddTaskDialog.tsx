"use client";

import { useEffect, useState } from "react";
import { Bell, CalendarDays, Clock3, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTaskStore } from "@/store/taskStore";
import {
  Task,
  TaskCategory,
  TaskPriority,
} from "@/types/task";

interface AddTaskDialogProps {
  editTask?: Task;
  defaultDate?: string;
  onClose?: () => void;
}

const priorityOptions: {
  value: TaskPriority;
  label: string;
}[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const categoryOptions: {
  value: TaskCategory;
  label: string;
}[] = [
  { value: "study", label: "Study" },
  { value: "development", label: "Development" },
  { value: "personal", label: "Personal" },
  { value: "fitness", label: "Fitness" },
  { value: "other", label: "Other" },
];

const reminderOptions = [
  { value: 0, label: "At task time" },
  { value: 1, label: "1 minute before" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function AddTaskDialog({
  editTask,
  defaultDate,
  onClose,
}: AddTaskDialogProps) {
  const { addTask, updateTask } = useTaskStore();

  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState(
    editTask?.date ?? defaultDate ?? ""
  );

  const [startTime, setStartTime] = useState(
    editTask?.startTime ?? ""
  );

  const [endTime, setEndTime] = useState(
    editTask?.endTime ?? ""
  );

  const [priority, setPriority] = useState<TaskPriority>(
    editTask?.priority ?? "medium"
  );

  const [category, setCategory] = useState<TaskCategory>(
    editTask?.category ?? "other"
  );

  const [reminder, setReminder] = useState(
    editTask?.reminder ?? 0
  );

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description ?? "");
      setDate(editTask.date);
      setStartTime(editTask.startTime ?? "");
      setEndTime(editTask.endTime ?? "");
      setPriority(editTask.priority);
      setCategory(editTask.category);
      setReminder(editTask.reminder ?? 0);

      setOpen(true);
      return;
    }

    setDate(defaultDate ?? getToday());
  }, [editTask, defaultDate]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(defaultDate ?? getToday());
    setStartTime("");
    setEndTime("");
    setPriority("medium");
    setCategory("other");
    setReminder(0);
  };

  const handleClose = () => {
    setOpen(false);

    if (!editTask) {
      resetForm();
    }

    onClose?.();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      return;
    }

    if (!date) {
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

      handleClose();
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
      alarmEnabled: true,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    handleClose();
  };

  return (
    <>
      {!editTask && (
        <Button
          type="button"
          onClick={() => {
            setDate(defaultDate ?? getToday());
            setOpen(true);
          }}
          className="gap-2"
        >
          <Plus size={16} />
          Add Task
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            handleClose();
          } else {
            setOpen(true);
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#111114] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editTask ? "Edit Task" : "Add New Task"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>

              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you need to do?"
                className="border-white/10 bg-white/[0.03]"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="task-description">
                Description
              </Label>

              <textarea
                id="task-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Add some details..."
                rows={3}
                className="w-full resize-none rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label
                htmlFor="task-date"
                className="flex items-center gap-2"
              >
                <CalendarDays size={15} />
                Date
              </Label>

              <Input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-white/10 bg-white/[0.03]"
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="task-start-time"
                  className="flex items-center gap-2"
                >
                  <Clock3 size={15} />
                  Start Time
                </Label>

                <Input
                  id="task-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(e.target.value)
                  }
                  className="border-white/10 bg-white/[0.03]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-end-time">
                  End Time
                </Label>

                <Input
                  id="task-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(e.target.value)
                  }
                  className="border-white/10 bg-white/[0.03]"
                />
              </div>
            </div>

            {/* Priority + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>

                <Select
                  value={priority}
                  onValueChange={(value) =>
                    setPriority(value as TaskPriority)
                  }
                >
                  <SelectTrigger className="border-white/10 bg-white/[0.03]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>

                <Select
                  value={category}
                  onValueChange={(value) =>
                    setCategory(value as TaskCategory)
                  }
                >
                  <SelectTrigger className="border-white/10 bg-white/[0.03]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reminder */}
            <div className="space-y-2">
              <Label
                htmlFor="task-reminder"
                className="flex items-center gap-2"
              >
                <Bell size={15} />
                Reminder
              </Label>

              <Select
                value={String(reminder)}
                onValueChange={(value) =>
                  setReminder(Number(value))
                }
              >
                <SelectTrigger
                  id="task-reminder"
                  className="border-white/10 bg-white/[0.03]"
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {reminderOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={String(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-white/10 bg-transparent"
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!title.trim() || !date}
              >
                {editTask ? "Save Changes" : "Create Task"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}