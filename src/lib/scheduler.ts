import { Task } from "@/types/task";

export type TaskStatus =
  | "upcoming"
  | "current"
  | "completed"
  | "missed";

export function getTaskStatus(task: Task): TaskStatus {
  if (task.completed) {
    return "completed";
  }

  if (!task.startTime) {
    return "upcoming";
  }

  const now = new Date();

  const today = now.toISOString().split("T")[0];

  if (task.date !== today) {
    return "upcoming";
  }

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const [startHour, startMinute] = task.startTime
    .split(":")
    .map(Number);

  const startMinutes =
    startHour * 60 + startMinute;

  if (!task.endTime) {
    if (currentMinutes < startMinutes) {
      return "upcoming";
    }

    if (currentMinutes === startMinutes) {
      return "current";
    }

    return "missed";
  }

  const [endHour, endMinute] = task.endTime
    .split(":")
    .map(Number);

  const endMinutes =
    endHour * 60 + endMinute;

  if (currentMinutes < startMinutes) {
    return "upcoming";
  }

  if (
    currentMinutes >= startMinutes &&
    currentMinutes < endMinutes
  ) {
    return "current";
  }

  return "missed";
}

export function getMinutesUntilTask(
  task: Task
): number | null {
  if (!task.startTime) {
    return null;
  }

  const now = new Date();

  const [hour, minute] = task.startTime
    .split(":")
    .map(Number);

  const taskDate = new Date();

  taskDate.setHours(hour, minute, 0, 0);

  return Math.round(
    (taskDate.getTime() - now.getTime()) / 60000
  );
}

export function getNextTask(
  tasks: Task[]
): Task | null {
  const now = new Date();

  const today = now.toISOString().split("T")[0];

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const upcomingTasks = tasks
    .filter((task) => {
      if (task.completed) {
        return false;
      }

      if (task.date !== today) {
        return false;
      }

      if (!task.startTime) {
        return false;
      }

      const [hour, minute] = task.startTime
        .split(":")
        .map(Number);

      const taskMinutes =
        hour * 60 + minute;

      return taskMinutes > currentMinutes;
    })
    .sort((a, b) =>
      (a.startTime ?? "").localeCompare(
        b.startTime ?? ""
      )
    );

  return upcomingTasks[0] ?? null;
}

export function getNextAlarm(
  tasks: Task[]
): Task | null {
  const now = new Date();

  const today = now.toISOString().split("T")[0];

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const upcomingAlarms = tasks
    .filter((task) => {
      if (task.completed) {
        return false;
      }

      if (task.alarmEnabled === false) {
        return false;
      }

      if (!task.startTime) {
        return false;
      }

      if (task.date !== today) {
        return false;
      }

      if (task.reminder === undefined) {
        return false;
      }

      const [hour, minute] = task.startTime
        .split(":")
        .map(Number);

      const taskMinutes =
        hour * 60 + minute;

      const alarmMinutes =
        taskMinutes - task.reminder;

      return alarmMinutes > currentMinutes;
    })
    .sort((a, b) => {
      const [aHour, aMinute] = (a.startTime ?? "00:00")
        .split(":")
        .map(Number);

      const [bHour, bMinute] = (b.startTime ?? "00:00")
        .split(":")
        .map(Number);

      const aAlarm =
        aHour * 60 +
        aMinute -
        (a.reminder ?? 0);

      const bAlarm =
        bHour * 60 +
        bMinute -
        (b.reminder ?? 0);

      return aAlarm - bAlarm;
    });

  return upcomingAlarms[0] ?? null;
}