"use client";

import * as React from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReviewDecisionButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size"
> & {
  loading?: boolean;
  /** Full label + icon layout; `false` = compact icon cell (e.g. tables). */
  showLabel?: boolean;
};

const approveGreen =
  "border-0 bg-emerald-600 text-white shadow-none hover:bg-emerald-700 focus-visible:ring-emerald-500/40 dark:bg-emerald-600 dark:hover:bg-emerald-500";

const rejectOutline =
  "border border-input bg-background text-foreground hover:bg-accent hover:text-foreground [&_svg]:text-foreground";

export function ApproveDecisionButton({
  className,
  loading,
  showLabel = true,
  disabled,
  children,
  ...props
}: ReviewDecisionButtonProps) {
  const label = children ?? "Approve";
  return (
    <Button
      type="button"
      size="sm"
      variant="default"
      disabled={disabled ?? loading}
      className={cn(
        approveGreen,
        showLabel
          ? "min-w-[7.5rem] justify-between gap-2 px-3 font-medium"
          : "h-9 w-9 shrink-0 justify-end px-0 pr-2 font-medium",
        className
      )}
      {...props}
    >
      {showLabel ? <span className="text-sm">{label}</span> : <span className="sr-only">Approve</span>}
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white" aria-hidden />
      ) : (
        <Check className="h-4 w-4 shrink-0 text-white" aria-hidden />
      )}
    </Button>
  );
}

export function RejectDecisionButton({
  className,
  loading,
  showLabel = true,
  disabled,
  children,
  ...props
}: ReviewDecisionButtonProps) {
  const label = children ?? "Reject";
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={disabled ?? loading}
      className={cn(
        rejectOutline,
        showLabel
          ? "min-w-[6.75rem] justify-start gap-2 px-3 font-medium"
          : "h-9 w-9 shrink-0 justify-start px-0 pl-2 font-medium",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-foreground" aria-hidden />
      ) : (
        <X className="h-4 w-4 shrink-0 text-foreground" aria-hidden />
      )}
      {showLabel ? <span className="text-sm">{label}</span> : <span className="sr-only">Reject</span>}
    </Button>
  );
}
