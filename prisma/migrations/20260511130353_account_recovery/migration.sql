-- CreateEnum
CREATE TYPE "RecoveryPurpose" AS ENUM ('REVEAL_USERNAME', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "account_recovery_codes" (
    "account_recovery_code_id" TEXT NOT NULL,
    "purpose" "RecoveryPurpose" NOT NULL,
    "code_hash" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "username_norm" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_recovery_codes_pkey" PRIMARY KEY ("account_recovery_code_id")
);

-- CreateTable
CREATE TABLE "password_change_tickets" (
    "password_change_ticket_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "password_change_tickets_pkey" PRIMARY KEY ("password_change_ticket_id")
);

-- CreateIndex
CREATE INDEX "account_recovery_codes_university_id_purpose_idx" ON "account_recovery_codes"("university_id", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "password_change_tickets_token_key" ON "password_change_tickets"("token");

-- CreateIndex
CREATE INDEX "password_change_tickets_member_id_idx" ON "password_change_tickets"("member_id");

-- AddForeignKey
ALTER TABLE "password_change_tickets" ADD CONSTRAINT "password_change_tickets_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;
