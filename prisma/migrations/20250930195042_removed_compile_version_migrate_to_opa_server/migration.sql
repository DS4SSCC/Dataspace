/*
  Warnings:

  - You are about to drop the column `data` on the `Policy` table. All the data in the column will be lost.
  - You are about to drop the column `rego` on the `Policy` table. All the data in the column will be lost.
  - Added the required column `raw` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Policy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "raw" TEXT NOT NULL
);
INSERT INTO "new_Policy" ("description", "id", "name") SELECT "description", "id", "name" FROM "Policy";
DROP TABLE "Policy";
ALTER TABLE "new_Policy" RENAME TO "Policy";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
