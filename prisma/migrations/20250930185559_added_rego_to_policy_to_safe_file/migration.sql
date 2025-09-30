/*
  Warnings:

  - Added the required column `rego` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Policy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data" BLOB,
    "rego" TEXT NOT NULL
);
INSERT INTO "new_Policy" ("data", "description", "id", "name") SELECT "data", "description", "id", "name" FROM "Policy";
DROP TABLE "Policy";
ALTER TABLE "new_Policy" RENAME TO "Policy";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
