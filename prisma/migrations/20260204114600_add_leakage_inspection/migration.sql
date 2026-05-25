-- AlterTable
ALTER TABLE "PDIInspection" ADD COLUMN "customerSignature" TEXT;

-- CreateTable
CREATE TABLE "PDILeakageItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "PDILeakageResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspectionId" TEXT NOT NULL,
    "leakageItemId" TEXT NOT NULL,
    "found" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "PDILeakageResponse_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "PDIInspection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PDILeakageResponse_leakageItemId_fkey" FOREIGN KEY ("leakageItemId") REFERENCES "PDILeakageItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PDISection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sectionType" TEXT NOT NULL DEFAULT 'CHECKLIST'
);
INSERT INTO "new_PDISection" ("id", "name", "order") SELECT "id", "name", "order" FROM "PDISection";
DROP TABLE "PDISection";
ALTER TABLE "new_PDISection" RENAME TO "PDISection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PDILeakageResponse_inspectionId_leakageItemId_key" ON "PDILeakageResponse"("inspectionId", "leakageItemId");
