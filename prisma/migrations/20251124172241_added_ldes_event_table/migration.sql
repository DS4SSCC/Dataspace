-- CreateTable
CREATE TABLE "ldes_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataset_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version_of" TEXT,
    "previous" TEXT,
    CONSTRAINT "ldes_events_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ldes_events_timestamp_idx" ON "ldes_events"("timestamp");
