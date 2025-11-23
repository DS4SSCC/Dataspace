/*
  Warnings:

  - You are about to drop the column `apiKey` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `apiStandard` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `apiUrl` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `lastSync` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `accessRights` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `accessUrl` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `catalogId` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `downloadUrl` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `importedAt` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `mediaType` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `policyIntent` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `temporalEnd` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `temporalStart` on the `datasets` table. All the data in the column will be lost.
  - Added the required column `api_standard` to the `catalogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `api_url` to the `catalogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `catalogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalog_id` to the `datasets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "LDNNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataset_id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "delivered_at" DATETIME,
    "ldes_event_id" TEXT,
    CONSTRAINT "LDNNotification_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
INSERT INTO "new_catalogs" ("description", "id", "name", "title") SELECT "description", "id", "name", "title" FROM "catalogs";
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
    "notes" TEXT,
    "imported_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" DATETIME,
    CONSTRAINT "datasets_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "catalogs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_datasets" ("description", "id", "identifier", "issued", "language", "license", "modified", "notes", "spatial", "theme", "title") SELECT "description", "id", "identifier", "issued", "language", "license", "modified", "notes", "spatial", "theme", "title" FROM "datasets";
DROP TABLE "datasets";
ALTER TABLE "new_datasets" RENAME TO "datasets";
CREATE UNIQUE INDEX "datasets_catalog_id_identifier_key" ON "datasets"("catalog_id", "identifier");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LDNNotification_dataset_id_created_at_idx" ON "LDNNotification"("dataset_id", "created_at");
