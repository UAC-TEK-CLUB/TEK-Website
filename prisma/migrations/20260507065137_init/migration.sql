-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ALUMNI', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('OFFICER', 'REGULAR');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('GENERAL', 'WORKSHOP', 'HACKATHON', 'SOCIAL', 'OFFICER_ONLY');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'EXCUSED', 'LATE');

-- CreateEnum
CREATE TYPE "TutoringStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "members" (
    "member_id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password_hash" TEXT,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membership_status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "member_type" "MemberType" NOT NULL,
    "mentor_id" TEXT,

    CONSTRAINT "members_pkey" PRIMARY KEY ("member_id")
);

-- CreateTable
CREATE TABLE "club_officers" (
    "member_id" TEXT NOT NULL,
    "admin_access_level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "club_officers_pkey" PRIMARY KEY ("member_id")
);

-- CreateTable
CREATE TABLE "regular_members" (
    "member_id" TEXT NOT NULL,
    "expected_graduation" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regular_members_pkey" PRIMARY KEY ("member_id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "visitor_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "browser_type" TEXT NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("visitor_id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "university_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("university_id")
);

-- CreateTable
CREATE TABLE "club_applications" (
    "club_app_id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "visitor_id" TEXT,
    "major" TEXT NOT NULL,
    "coding_experience" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_applications_pkey" PRIMARY KEY ("club_app_id")
);

-- CreateTable
CREATE TABLE "labs" (
    "lab_id" TEXT NOT NULL,
    "lab_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labs_pkey" PRIMARY KEY ("lab_id")
);

-- CreateTable
CREATE TABLE "lab_applications" (
    "lab_app_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "lab_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_applications_pkey" PRIMARY KEY ("lab_app_id")
);

-- CreateTable
CREATE TABLE "lab_proposals" (
    "proposal_id" TEXT NOT NULL,
    "proposed_by" TEXT NOT NULL,
    "reviewed_by" TEXT,
    "proposed_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "proposed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_proposals_pkey" PRIMARY KEY ("proposal_id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "meeting_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "type" "MeetingType" NOT NULL,
    "location" TEXT,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("meeting_id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "meeting_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "attendance_status" "AttendanceStatus" NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("meeting_id","member_id")
);

-- CreateTable
CREATE TABLE "bulletin_board" (
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "posted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bulletin_board_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "gallery_photos" (
    "photo_id" TEXT NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_photos_pkey" PRIMARY KEY ("photo_id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "message_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "tutoring_sessions" (
    "session_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_mins" INTEGER NOT NULL DEFAULT 60,
    "status" "TutoringStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "tutoring_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "website_health_logs" (
    "log_id" TEXT NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_health_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_university_id_key" ON "members"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_email_key" ON "applicants"("email");

-- CreateIndex
CREATE INDEX "club_applications_status_idx" ON "club_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "labs_lab_name_key" ON "labs"("lab_name");

-- CreateIndex
CREATE UNIQUE INDEX "lab_applications_member_id_lab_id_key" ON "lab_applications"("member_id", "lab_id");

-- CreateIndex
CREATE INDEX "bulletin_board_posted_at_idx" ON "bulletin_board"("posted_at");

-- CreateIndex
CREATE INDEX "chat_messages_sender_id_receiver_id_sent_at_idx" ON "chat_messages"("sender_id", "receiver_id", "sent_at");

-- CreateIndex
CREATE INDEX "tutoring_sessions_tutor_id_scheduled_at_idx" ON "tutoring_sessions"("tutor_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "tutoring_sessions_student_id_scheduled_at_idx" ON "tutoring_sessions"("student_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "website_health_logs_metric_name_recorded_at_idx" ON "website_health_logs"("metric_name", "recorded_at");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "members"("member_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_officers" ADD CONSTRAINT "club_officers_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regular_members" ADD CONSTRAINT "regular_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_applications" ADD CONSTRAINT "club_applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicants"("university_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_applications" ADD CONSTRAINT "club_applications_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("visitor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_applications" ADD CONSTRAINT "lab_applications_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_applications" ADD CONSTRAINT "lab_applications_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("lab_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_proposals" ADD CONSTRAINT "lab_proposals_proposed_by_fkey" FOREIGN KEY ("proposed_by") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_proposals" ADD CONSTRAINT "lab_proposals_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "club_officers"("member_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("meeting_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletin_board" ADD CONSTRAINT "bulletin_board_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_health_logs" ADD CONSTRAINT "website_health_logs_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "club_officers"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;
