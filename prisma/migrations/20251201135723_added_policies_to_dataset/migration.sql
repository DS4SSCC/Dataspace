/*
  Warnings:

  - You are about to drop the column `created_at` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `last_sync` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `catalogs` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `catalogs` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_catalogs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "api_standard" TEXT NOT NULL,
    "api_url" TEXT NOT NULL,
    "api_key" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_catalogs" ("api_key", "api_standard", "api_url", "description", "id", "logo_url", "name", "title") SELECT "api_key", "api_standard", "api_url", "description", "id", "logo_url", "name", "title" FROM "catalogs";
DROP TABLE "catalogs";
ALTER TABLE "new_catalogs" RENAME TO "catalogs";
CREATE UNIQUE INDEX "catalogs_name_key" ON "catalogs"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
