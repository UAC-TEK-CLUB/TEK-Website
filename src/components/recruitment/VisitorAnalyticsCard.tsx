import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

export function VisitorAnalyticsCard({
  total,
  last30,
  withApp,
}: {
  total: number;
  last30: number;
  withApp: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Visitor analytics</CardTitle>
        <Eye className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">All-time</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{last30}</p>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{withApp}</p>
          <p className="text-xs text-muted-foreground">Converted</p>
        </div>
      </CardContent>
    </Card>
  );
}
