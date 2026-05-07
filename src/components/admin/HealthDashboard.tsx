import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { ClubOfficer, Member, WebsiteHealthLog } from "@prisma/client";

type Row = WebsiteHealthLog & {
  recordedBy: ClubOfficer & { member: Member };
};

export function HealthDashboard({ logs }: { logs: Row[] }) {
  const grouped = logs.reduce<Record<string, { last: number; count: number }>>(
    (acc, log) => {
      const existing = acc[log.metricName];
      if (!existing) {
        acc[log.metricName] = { last: log.metricValue, count: 1 };
      } else {
        existing.count += 1;
      }
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(grouped)
          .slice(0, 6)
          .map(([metric, info]) => (
            <Card key={metric}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{metric}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{info.last}</p>
                <p className="text-xs text-muted-foreground">{info.count} samples</p>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No metrics recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recorded</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.logId}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(log.recordedAt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.metricName}</TableCell>
                    <TableCell>{log.metricValue}</TableCell>
                    <TableCell className="text-sm">
                      {log.recordedBy.member.firstName} {log.recordedBy.member.lastName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
