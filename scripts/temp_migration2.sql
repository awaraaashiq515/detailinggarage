
CREATE TABLE IF NOT EXISTS "InquiryMessage" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "inquiryId"  TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId"   TEXT NOT NULL,
    "message"    TEXT NOT NULL,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InquiryMessage_inquiryId_fkey"
        FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "InquiryMessage_inquiryId_idx" ON "InquiryMessage"("inquiryId");
