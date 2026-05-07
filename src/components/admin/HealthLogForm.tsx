"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { recordHealthLog } from "@/server/actions/admin";

export function HealthLogForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await recordHealthLog({
          metricName: formData.get("metricName"),
          metricValue: formData.get("metricValue"),
        });
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not record metric.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Record metric
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record health metric</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metricName">Metric name</Label>
            <Input id="metricName" name="metricName" required placeholder="e.g. response_time_ms" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metricValue">Value</Label>
            <Input id="metricValue" name="metricValue" type="number" step="any" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
