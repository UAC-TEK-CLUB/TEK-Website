import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lab } from "@prisma/client";

export function LabGrid({
  labs,
  detailHrefPrefix = "/labs",
}: {
  labs: Lab[];
  detailHrefPrefix?: string;
}) {
  if (labs.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No labs yet — pitch one!
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {labs.map((lab) => (
        <Card key={lab.labId}>
          <CardHeader>
            <FlaskConical className="h-5 w-5 text-primary" />
            <CardTitle>{lab.labName}</CardTitle>
            <CardDescription className="line-clamp-2">{lab.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end text-sm">
            <Link
              href={`${detailHrefPrefix}/${lab.labId}`}
              className="inline-flex items-center text-primary hover:underline"
            >
              View <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
