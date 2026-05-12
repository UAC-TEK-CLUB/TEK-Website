import Link from "next/link";
import { listLabs } from "@/server/actions/labs";
import { isPresident, requireMember } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateLabForm } from "@/components/labs/CreateLabForm";
import { LabGrid } from "@/components/labs/LabGrid";

export default async function AdminLabsPage() {
  const user = await requireMember();
  const labs = await listLabs();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Labs</h1>
          <p className="text-sm text-muted-foreground">
            Manage rosters and create new labs directly.
          </p>
        </div>
        <CreateLabForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All labs</CardTitle>
        </CardHeader>
        <CardContent>
          <LabGrid labs={labs} detailHrefPrefix="/admin/labs" />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Tip: members pitch new labs through{" "}
        {isPresident(user) ? (
          <Link href="/admin/proposals" className="underline">
            /admin/proposals
          </Link>
        ) : (
          <span className="text-muted-foreground">the proposals queue (president).</span>
        )}
      </p>
    </div>
  );
}
