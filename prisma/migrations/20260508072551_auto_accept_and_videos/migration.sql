-- CreateEnum
CREATE TYPE "VideoProvider" AS ENUM ('YOUTUBE', 'VIMEO', 'OTHER');

-- DropForeignKey
ALTER TABLE "tutoring_sessions" DROP CONSTRAINT "tutoring_sessions_student_id_fkey";

-- DropForeignKey
ALTER TABLE "tutoring_sessions" DROP CONSTRAINT "tutoring_sessions_tutor_id_fkey";

-- AlterTable
ALTER TABLE "club_applications" ADD COLUMN     "account_setup_token" TEXT;

-- DropTable
DROP TABLE "tutoring_sessions";

-- DropEnum
DROP TYPE "TutoringStatus";

-- CreateTable
CREATE TABLE "tutoring_videos" (
    "video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "video_url" TEXT NOT NULL,
    "provider" "VideoProvider" NOT NULL DEFAULT 'OTHER',
    "uploader_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutoring_videos_pkey" PRIMARY KEY ("video_id")
);

-- CreateIndex
CREATE INDEX "tutoring_videos_created_at_idx" ON "tutoring_videos"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "club_applications_account_setup_token_key" ON "club_applications"("account_setup_token");

-- AddForeignKey
ALTER TABLE "tutoring_videos" ADD CONSTRAINT "tutoring_videos_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;
