-- CreateTable
CREATE TABLE "PDIConfirmationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "packageId" TEXT,
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PDIInspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "vehicleMake" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehicleColor" TEXT NOT NULL,
    "vehicleYear" TEXT,
    "vin" TEXT,
    "engineNumber" TEXT,
    "odometer" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "inspectionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PDIInspection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PDIInspection" ("createdAt", "customerEmail", "customerName", "customerPhone", "engineNumber", "id", "inspectionDate", "odometer", "status", "updatedAt", "vehicleColor", "vehicleMake", "vehicleModel", "vehicleYear", "vin") SELECT "createdAt", "customerEmail", "customerName", "customerPhone", "engineNumber", "id", "inspectionDate", "odometer", "status", "updatedAt", "vehicleColor", "vehicleMake", "vehicleModel", "vehicleYear", "vin" FROM "PDIInspection";
DROP TABLE "PDIInspection";
ALTER TABLE "new_PDIInspection" RENAME TO "PDIInspection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
