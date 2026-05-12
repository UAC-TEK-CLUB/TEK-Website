-- Spotlight project is one row per lab (not per member).

ALTER TABLE "leader_projects" ADD COLUMN "lab_id" TEXT;

UPDATE "leader_projects" AS lp
SET "lab_id" = (
  SELECT l."lab_id"
  FROM "labs" l
  WHERE l."leader_member_id" = lp."leader_id"
  ORDER BY l."lab_id"
  LIMIT 1
);

DELETE FROM "leader_projects" WHERE "lab_id" IS NULL;

ALTER TABLE "leader_projects" DROP CONSTRAINT "leader_projects_leader_id_fkey";

DROP INDEX "leader_projects_leader_id_key";

ALTER TABLE "leader_projects" DROP COLUMN "leader_id";

ALTER TABLE "leader_projects" ALTER COLUMN "lab_id" SET NOT NULL;

CREATE UNIQUE INDEX "leader_projects_lab_id_key" ON "leader_projects"("lab_id");

ALTER TABLE "leader_projects"
ADD CONSTRAINT "leader_projects_lab_id_fkey"
FOREIGN KEY ("lab_id") REFERENCES "labs"("lab_id") ON DELETE CASCADE ON UPDATE CASCADE;
