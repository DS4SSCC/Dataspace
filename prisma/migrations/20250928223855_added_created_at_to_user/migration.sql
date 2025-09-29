-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_salt" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "password_digest" TEXT NOT NULL
);
INSERT INTO "new_User" ("email", "full_name", "id", "password_digest", "password_hash", "password_salt") SELECT "email", "full_name", "id", "password_digest", "password_hash", "password_salt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
