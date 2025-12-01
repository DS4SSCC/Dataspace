/*
  Warnings:

  - Added the required column `package` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Policy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "package" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "raw" TEXT NOT NULL
);
INSERT INTO "new_Policy" ("active", "description", "id", "name", "raw") SELECT "active", "description", "id", "name", "raw" FROM "Policy";
DROP TABLE "Policy";
ALTER TABLE "new_Policy" RENAME TO "Policy";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
