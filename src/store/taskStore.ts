"use client";

import { create } from "zustand";
import { Task } from "@/types/task";

interface TaskStore {
  tasks: Task[];
  initialized: boolean;

  loadTasks: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  clearTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  initialized: false,

  loadTasks: async () => {
    try {
      const response = await fetch("/api/tasks");

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const tasks: Task[] = await response.json();

      set({
        tasks,
        initialized: true,
      });
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  },

  addTask: async (task) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const createdTask: Task = await response.json();

      set((state) => ({
        tasks: [...state.tasks, createdTask],
      }));
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  },

  updateTask: async (id, updates) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask: Task = await response.json();

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((item) => item.id === id);

    if (!task) return;

    await get().updateTask(id, {
      completed: !task.completed,
    });
  },

  clearTasks: async () => {
    const tasks = get().tasks;

    try {
      await Promise.all(
        tasks.map((task) =>
          fetch(`/api/tasks/${task.id}`, {
            method: "DELETE",
          })
        )
      );

      set({ tasks: [] });
    } catch (error) {
      console.error("Failed to clear tasks:", error);
    }
  },
}));