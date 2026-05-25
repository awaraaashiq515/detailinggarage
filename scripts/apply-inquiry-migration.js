const { execSync } = require("child_process")
const path = require("path")
const fs = require("fs")

const sql = [
    'CREATE TABLE IF NOT EXISTS "InquiryMessage" (',
    '    "id"         TEXT NOT NULL PRIMARY KEY,',
    '    "inquiryId"  TEXT NOT NULL,',
    '    "senderType" TEXT NOT NULL,',
    '    "senderId"   TEXT NOT NULL,',
    '    "message"    TEXT NOT NULL,',
    '    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,',
    '    CONSTRAINT "InquiryMessage_inquiryId_fkey"',
    '        FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE',
    ');',
    'CREATE INDEX IF NOT EXISTS "InquiryMessage_inquiryId_idx" ON "InquiryMessage"("inquiryId");',
].join("\n")

const root = path.join(__dirname, "..")
const prismaEntrypoint = path.join(root, "node_modules", "prisma", "build", "index.js")

try {
    execSync(
        `node "${prismaEntrypoint}" db execute --stdin --schema="${path.join(root, "prisma", "schema.prisma")}"`,
        { input: sql, stdio: ["pipe", "inherit", "inherit"], cwd: root }
    )
    console.log("Done! InquiryMessage table ready.")
} catch (e) {
    console.error("Migration failed:", e.message)
    process.exit(1)
}
