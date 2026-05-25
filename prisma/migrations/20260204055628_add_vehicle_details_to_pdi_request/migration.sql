/*
  Warnings:

  - You are about to drop the column `packageId` on the `PDIConfirmationRequest` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PDIConfirmationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "preferredDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "adminNotes" TEXT,
    "adminMessage" TEXT,
    "pdiInspectionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PDIConfirmationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PDIConfirmationRequest" ("adminMessage", "adminNotes", "createdAt", "id", "location", "notes", "pdiInspectionId", "preferredDate", "status", "updatedAt", "userId", "vehicleModel", "vehicleName") SELECT "adminMessage", "adminNotes", "createdAt", "id", "location", "notes", "pdiInspectionId", "preferredDate", "status", "updatedAt", "userId", "vehicleModel", "vehicleName" FROM "PDIConfirmationRequest";
DROP TABLE "PDIConfirmationRequest";
ALTER TABLE "new_PDIConfirmationRequest" RENAME TO "PDIConfirmationRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
