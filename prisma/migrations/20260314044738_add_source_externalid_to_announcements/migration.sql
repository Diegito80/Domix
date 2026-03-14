-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SchoolAnnouncement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT 'general',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "externalId" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SchoolAnnouncement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "FamilyMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SchoolAnnouncement" ("authorId", "content", "createdAt", "id", "pinned", "priority", "subject", "title", "updatedAt") SELECT "authorId", "content", "createdAt", "id", "pinned", "priority", "subject", "title", "updatedAt" FROM "SchoolAnnouncement";
DROP TABLE "SchoolAnnouncement";
ALTER TABLE "new_SchoolAnnouncement" RENAME TO "SchoolAnnouncement";
CREATE UNIQUE INDEX "SchoolAnnouncement_externalId_key" ON "SchoolAnnouncement"("externalId");
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT,
    "pointsValue" INTEGER NOT NULL DEFAULT 0,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" TEXT,
    "dueDate" DATETIME,
    "dueTime" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "FamilyMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "FamilyMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("assignedToId", "category", "completed", "completedAt", "createdAt", "createdById", "description", "dueDate", "dueTime", "emoji", "id", "isRecurring", "pointsValue", "recurrence", "title", "updatedAt") SELECT "assignedToId", "category", "completed", "completedAt", "createdAt", "createdById", "description", "dueDate", "dueTime", "emoji", "id", "isRecurring", "pointsValue", "recurrence", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
