-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT NOT NULL DEFAULT 'other',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "reminder" INTEGER,
    "alarmEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FocusSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT,
    "taskTitle" TEXT,
    "mode" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "completedAt" DATETIME NOT NULL,
    CONSTRAINT "FocusSession_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlarmHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT,
    "taskTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "triggeredAt" DATETIME NOT NULL,
    "stoppedAt" DATETIME,
    "snoozedUntil" DATETIME,
    CONSTRAINT "AlarmHistory_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Task_date_idx" ON "Task"("date");

-- CreateIndex
CREATE INDEX "Task_completed_idx" ON "Task"("completed");

-- CreateIndex
CREATE INDEX "FocusSession_taskId_idx" ON "FocusSession"("taskId");

-- CreateIndex
CREATE INDEX "FocusSession_completedAt_idx" ON "FocusSession"("completedAt");

-- CreateIndex
CREATE INDEX "AlarmHistory_taskId_idx" ON "AlarmHistory"("taskId");

-- CreateIndex
CREATE INDEX "AlarmHistory_triggeredAt_idx" ON "AlarmHistory"("triggeredAt");
