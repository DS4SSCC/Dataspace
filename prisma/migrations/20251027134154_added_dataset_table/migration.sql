-- CreateTable
CREATE TABLE "datasets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "catalogId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "issued" DATETIME,
    "modified" DATETIME,
    "language" TEXT,
    "theme" TEXT,
    "spatial" TEXT,
    "temporalStart" DATETIME,
    "temporalEnd" DATETIME,
    "license" TEXT,
    "accessRights" TEXT,
    "accessUrl" TEXT,
    "downloadUrl" TEXT,
    "mediaType" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "policyIntent" TEXT DEFAULT 'PUBLIC',
    "notes" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    CONSTRAINT "datasets_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "catalogs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "datasets_catalogId_identifier_key" ON "datasets"("catalogId", "identifier");
