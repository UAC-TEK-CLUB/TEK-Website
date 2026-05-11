-- CreateTable
CREATE TABLE "leader_projects" (
    "project_id" TEXT NOT NULL,
    "leader_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leader_projects_pkey" PRIMARY KEY ("project_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leader_projects_leader_id_key" ON "leader_projects"("leader_id");

-- CreateIndex
CREATE INDEX "leader_projects_updated_at_idx" ON "leader_projects"("updated_at");

-- AddForeignKey
ALTER TABLE "leader_projects" ADD CONSTRAINT "leader_projects_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "members"("member_id") ON DELETE CASCADE ON UPDATE CASCADE;
