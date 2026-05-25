-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packagesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoApproveUsers" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);
INSERT INTO "new_SystemSettings" ("id", "packagesEnabled", "updatedAt", "updatedBy") SELECT "id", "packagesEnabled", "updatedAt", "updatedBy" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
