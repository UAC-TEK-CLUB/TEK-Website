-- Replace OfficerRole enum (remove OFFICER, add LEADER; map existing OFFICER -> LEADER)
CREATE TYPE "OfficerRole_new" AS ENUM ('PRESIDENT', 'SUPERVISOR', 'LEADER');

ALTER TABLE "club_officers" ALTER COLUMN "officer_role" DROP DEFAULT;

ALTER TABLE "club_officers" ALTER COLUMN "officer_role" TYPE "OfficerRole_new"
  USING (
    CASE "officer_role"::text
      WHEN 'OFFICER' THEN 'LEADER'::"OfficerRole_new"
      ELSE ("officer_role"::text)::"OfficerRole_new"
    END
  );

DROP TYPE "OfficerRole";

ALTER TYPE "OfficerRole_new" RENAME TO "OfficerRole";

ALTER TABLE "club_officers" ALTER COLUMN "officer_role" SET DEFAULT 'LEADER'::"OfficerRole";

-- Lab leader assignment (executives assign; lab leaders manage roster + lab posts)
ALTER TABLE "labs" ADD COLUMN "leader_member_id" TEXT;

ALTER TABLE "labs" ADD CONSTRAINT "labs_leader_member_id_fkey"
  FOREIGN KEY ("leader_member_id") REFERENCES "members"("member_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Optional lab scope for bulletin posts
ALTER TABLE "bulletin_board" ADD COLUMN "lab_id" TEXT;

ALTER TABLE "bulletin_board" ADD CONSTRAINT "bulletin_board_lab_id_fkey"
  FOREIGN KEY ("lab_id") REFERENCES "labs"("lab_id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "bulletin_board_lab_id_idx" ON "bulletin_board"("lab_id");
