-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AlarmHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "taskId" TEXT,
    "taskTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "triggeredAt" DATETIME NOT NULL,
    "stoppedAt" DATETIME,
    "snoozedUntil" DATETIME,
    CONSTRAINT "AlarmHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AlarmHistory_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AlarmHistory" ("id", "snoozedUntil", "status", "stoppedAt", "taskId", "taskTitle", "triggeredAt") SELECT "id", "snoozedUntil", "status", "stoppedAt", "taskId", "taskTitle", "triggeredAt" FROM "AlarmHistory";
DROP TABLE "AlarmHistory";
ALTER TABLE "new_AlarmHistory" RENAME TO "AlarmHistory";
CREATE INDEX "AlarmHistory_userId_idx" ON "AlarmHistory"("userId");
CREATE INDEX "AlarmHistory_taskId_idx" ON "AlarmHistory"("taskId");
CREATE INDEX "AlarmHistory_triggeredAt_idx" ON "AlarmHistory"("triggeredAt");
CREATE TABLE "new_FocusSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "taskId" TEXT,
    "taskTitle" TEXT,
    "mode" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "completedAt" DATETIME NOT NULL,
    CONSTRAINT "FocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FocusSession_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FocusSession" ("completedAt", "durationSeconds", "id", "mode", "startedAt", "taskId", "taskTitle") SELECT "completedAt", "durationSeconds", "id", "mode", "startedAt", "taskId", "taskTitle" FROM "FocusSession";
DROP TABLE "FocusSession";
ALTER TABLE "new_FocusSession" RENAME TO "FocusSession";
CREATE INDEX "FocusSession_userId_idx" ON "FocusSession"("userId");
CREATE INDEX "FocusSession_taskId_idx" ON "FocusSession"("taskId");
CREATE INDEX "FocusSession_completedAt_idx" ON "FocusSession"("completedAt");
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
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
    "snoozedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("alarmEnabled", "category", "completed", "createdAt", "date", "description", "endTime", "id", "priority", "reminder", "snoozedUntil", "startTime", "title") SELECT "alarmEnabled", "category", "completed", "createdAt", "date", "description", "endTime", "id", "priority", "reminder", "snoozedUntil", "startTime", "title" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_userId_idx" ON "Task"("userId");
CREATE INDEX "Task_date_idx" ON "Task"("date");
CREATE INDEX "Task_completed_idx" ON "Task"("completed");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
