-- CreateTable
CREATE TABLE "PDIImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspectionId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PDIImage_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "PDIInspection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
