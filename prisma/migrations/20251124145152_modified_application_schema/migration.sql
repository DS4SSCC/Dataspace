/*
  Warnings:

  - Made the column `owner_id` on table `applications` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "api_key" TEXT NOT NULL,
    "inbox_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "owner_id" TEXT NOT NULL,
    CONSTRAINT "applications_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_applications" ("api_key", "created_at", "description", "id", "inbox_url", "is_active", "name", "owner_id", "updated_at") SELECT "api_key", "created_at", "description", "id", "inbox_url", "is_active", "name", "owner_id", "updated_at" FROM "applications";
DROP TABLE "applications";
ALTER TABLE "new_applications" RENAME TO "applications";
CREATE UNIQUE INDEX "applications_api_key_key" ON "applications"("api_key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
