/*
  Warnings:

  - You are about to drop the column `inbox_urls` on the `applications` table. All the data in the column will be lost.
  - Added the required column `inbox_url` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "api_key" TEXT NOT NULL,
    "inbox_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "owner_id" TEXT,
    CONSTRAINT "applications_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_applications" ("api_key", "created_at", "description", "id", "is_active", "name", "owner_id", "updated_at") SELECT "api_key", "created_at", "description", "id", "is_active", "name", "owner_id", "updated_at" FROM "applications";
DROP TABLE "applications";
ALTER TABLE "new_applications" RENAME TO "applications";
CREATE UNIQUE INDEX "applications_name_key" ON "applications"("name");
CREATE UNIQUE INDEX "applications_api_key_key" ON "applications"("api_key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
