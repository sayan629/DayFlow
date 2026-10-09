import { Task } from "@/types/task";

export type TaskStatus =
  | "upcoming"
  | "current"
  | "completed"
  | "missed";

function getTodayString(now: Date) {
  return now.toISOString().split("T")[0];
}

function getMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
}

function getCurrentMinutes(now: Date) {
  return now.getHours() * 60 + now.getMinutes();
}

export function getTaskStatus(
  task: Task,
  now = new Date()
): TaskStatus {
  if (task.completed) {
    return "completed";
  }

  if (!task.startTime) {
    return "upcoming";
  }

  const today = getTodayString(now);

  if (task.date !== today) {
    return "upcoming";
  }

  const currentMinutes =
    getCurrentMinutes(now);

  const startMinutes =
    getMinutes(task.startTime);

  /*
   * No end time:
   *
   * Before start  → upcoming
   * At/after start → current
   *
   * We don't mark it missed because there is
   * no defined end time.
   */
  if (!task.endTime) {
    if (currentMinutes < startMinutes) {
      return "upcoming";
    }

    return "current";
  }

  const endMinutes =
    getMinutes(task.endTime);

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

/*
 * Returns the task that is currently active.
 */
export function getActiveTask(
  tasks: Task[],
  now = new Date()
): Task | null {
  return (
    tasks.find(
      (task) =>
        getTaskStatus(task, now) ===
        "current"
    ) ?? null
  );
}

/*
 * Returns the next task that has not started yet.
 */
export function getNextTask(
  tasks: Task[],
  now = new Date()
): Task | null {
  const today = getTodayString(now);
  const currentMinutes =
    getCurrentMinutes(now);

  const upcomingTasks = tasks
    .filter((task) => {
      if (task.completed) return false;
      if (task.date !== today) return false;
      if (!task.startTime) return false;

      const startMinutes =
        getMinutes(task.startTime);

      return startMinutes > currentMinutes;
    })
    .sort((a, b) =>
      (a.startTime ?? "").localeCompare(
        b.startTime ?? ""
      )
    );

  return upcomingTasks[0] ?? null;
}

/*
 * Returns the next scheduled task, including
 * the currently active task.
 *
 * Priority:
 * 1. Current task
 * 2. Upcoming task
 */
export function getNextScheduledTask(
  tasks: Task[],
  now = new Date()
): Task | null {
  const activeTask = getActiveTask(
    tasks,
    now
  );

  if (activeTask) {
    return activeTask;
  }

  return getNextTask(tasks, now);
}

/*
 * Minutes until a task starts.
 */
export function getMinutesUntilTask(
  task: Task,
  now = new Date()
): number | null {
  if (!task.startTime) {
    return null;
  }

  const [hour, minute] =
    task.startTime.split(":").map(Number);

  const taskDate = new Date(now);

  taskDate.setHours(
    hour,
    minute,
    0,
    0
  );

  return Math.round(
    (taskDate.getTime() -
      now.getTime()) /
      60000
  );
}

/*
 * Returns the next alarm scheduled for today.
 */
export function getNextAlarm(
  tasks: Task[],
  now = new Date()
): Task | null {
  const today = getTodayString(now);
  const currentMinutes =
    getCurrentMinutes(now);

  const upcomingAlarms = tasks
    .filter((task) => {
      if (task.completed) return false;
      if (task.alarmEnabled === false) {
        return false;
      }

      if (!task.startTime) return false;
      if (task.date !== today) return false;

      if (
        task.reminder === undefined ||
        task.reminder === null
      ) {
        return false;
      }

      const startMinutes =
        getMinutes(task.startTime);

      const alarmMinutes =
        startMinutes - task.reminder;

      return alarmMinutes > currentMinutes;
    })
    .sort((a, b) => {
      const aStart = getMinutes(
        a.startTime ?? "00:00"
      );

      const bStart = getMinutes(
        b.startTime ?? "00:00"
      );

      const aAlarm =
        aStart - (a.reminder ?? 0);

      const bAlarm =
        bStart - (b.reminder ?? 0);

      return aAlarm - bAlarm;
    });

  return upcomingAlarms[0] ?? null;
}