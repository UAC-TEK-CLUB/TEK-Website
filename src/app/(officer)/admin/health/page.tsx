import { listHealthLogs } from "@/server/actions/admin";
import { HealthDashboard } from "@/components/admin/HealthDashboard";
import { HealthLogForm } from "@/components/admin/HealthLogForm";

export default async function AdminHealthPage() {
  const logs = await listHealthLogs();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Website health</h1>
          <p className="text-sm text-muted-foreground">
            Officer-recorded metrics for the portal.
          </p>
        </div>
        <HealthLogForm />
      </div>
      <HealthDashboard logs={logs} />
    </div>
  );
}
