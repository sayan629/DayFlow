"use client";

import { ListTodo } from "lucide-react";

import { useTaskStore } from "@/store/taskStore";
import TaskItem from "./TaskItem";

export default function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;

    return a.startTime.localeCompare(b.startTime);
  });