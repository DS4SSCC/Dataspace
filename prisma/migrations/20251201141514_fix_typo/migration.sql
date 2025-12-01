/*
  Warnings:

  - You are about to drop the column `createdAt` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `lastSync` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `policy` on the `datasets` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `catalogs` table without a default value. This is not possible if the table is not empty.

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
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_catalogs" ("api_key", "api_standard", "api_url", "description", "id", "logo_url", "name", "title") SELECT "api_key", "api_standard", "api_url", "description", "id", "logo_url", "name", "title" FROM "catalogs";
DROP TABLE "catalogs";
ALTER TABLE "new_catalogs" RENAME TO "catalogs";
CREATE UNIQUE INDEX "catalogs_name_key" ON "catalogs"("name");
CREATE TABLE "new_datasets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "catalog_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "issued" DATETIME,
    "modified" DATETIME,
    "language" TEXT,
    "theme" TEXT,
    "spatial" TEXT,
    "temporal_start" DATETIME,
    "temporal_end" DATETIME,
    "license" TEXT,
    "access_rights" TEXT,
    "access_url" TEXT,
    "download_url" TEXT,
    "media_type" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "policy_intent" TEXT DEFAULT 'PUBLIC',
    "policy_id" TEXT,
    "notes" TEXT,
    "imported_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" DATETIME,
    CONSTRAINT "datasets_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "catalogs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "datasets_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "Policy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_datasets" ("access_rights", "access_url", "catalog_id", "description", "download_url", "id", "identifier", "imported_at", "is_published", "issued", "language", "license", "media_type", "modified", "notes", "policy_intent", "published_at", "spatial", "temporal_end", "temporal_start", "theme", "title") SELECT "access_rights", "access_url", "catalog_id", "description", "download_url", "id", "identifier", "imported_at", "is_published", "issued", "language", "license", "media_type", "modified", "notes", "policy_intent", "published_at", "spatial", "temporal_end", "temporal_start", "theme", "title" FROM "datasets";
DROP TABLE "datasets";
ALTER TABLE "new_datasets" RENAME TO "datasets";
CREATE UNIQUE INDEX "datasets_catalog_id_identifier_key" ON "datasets"("catalog_id", "identifier");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
