export type TaskPriority = "low" | "medium" | "high";

export type TaskCategory =
  | "study"
  | "development"
  | "personal"
  | "fitness"
  | "other";

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  reminder?: number;
  alarmEnabled?: boolean;
  createdAt: string;
}