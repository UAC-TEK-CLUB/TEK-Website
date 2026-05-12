-- Up to two lab leaders per lab via join table (replaces single leader_member_id on labs).

CREATE TABLE "lab_leader_assignments" (
    "lab_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,

    CONSTRAINT "lab_leader_assignments_pkey" PRIMARY KEY ("lab_id","member_id")
);

ALTER TABLE "lab_leader_assignments" ADD CONSTRAINT "lab_leader_assignments_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("lab_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lab_leader_assignments" ADD CONSTRAINT "lab_leader_assignments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "lab_leader_assignments" ("lab_id", "member_id")
SELECT "lab_id", "leader_member_id" FROM "labs" WHERE "leader_member_id" IS NOT NULL;

ALTER TABLE "labs" DROP CONSTRAINT IF EXISTS "labs_leader_member_id_fkey";

ALTER TABLE "labs" DROP COLUMN IF EXISTS "leader_member_id";
