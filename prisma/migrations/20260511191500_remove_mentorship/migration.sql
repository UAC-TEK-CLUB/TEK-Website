-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_mentor_id_fkey";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "mentor_id";
