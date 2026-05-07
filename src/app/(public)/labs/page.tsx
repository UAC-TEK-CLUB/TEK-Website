import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listLabs } from "@/server/actions/labs";
import { LabGrid } from "@/components/labs/LabGrid";
import { auth } from "@/lib/auth";

export default async function PublicLabsPage() {
  const [labs, session] = await Promise.all([listLabs(), auth()]);
  return (
    <div className="container py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Our labs</h1>
          <p className="mt-2 text-muted-foreground">
            Specialty divisions where members work together on long-running projects.
          </p>
        </div>
        {session?.user && (
          <Button asChild>
            <Link href="/proposals/new">
              <Plus className="mr-2 h-4 w-4" /> Propose a lab
            </Link>
          </Button>
        )}
      </div>
      <LabGrid labs={labs} />
    </div>
  );
}
