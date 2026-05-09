-- CreateEnum
CREATE TYPE "OfficerRole" AS ENUM ('PRESIDENT', 'SUPERVISOR', 'OFFICER');

-- AlterTable
ALTER TABLE "club_officers" ADD COLUMN     "officer_role" "OfficerRole" NOT NULL DEFAULT 'OFFICER';

-- Backfill: any officer seeded as access level 5 was the founding president.
UPDATE "club_officers" SET "officer_role" = 'PRESIDENT' WHERE "admin_access_level" = 5;
