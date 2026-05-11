-- Site login username (distinct from official university_id on the application).
ALTER TABLE "members" ADD COLUMN "username" TEXT;

UPDATE "members" SET "username" = lower(trim("university_id")) WHERE "username" IS NULL;

ALTER TABLE "members" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX "members_username_key" ON "members"("username");
