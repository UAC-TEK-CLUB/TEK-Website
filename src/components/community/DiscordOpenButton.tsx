"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DiscordOpenButton({ inviteUrl }: { inviteUrl: string }) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="gap-2"
      onClick={() => window.open(inviteUrl, "_blank", "noopener,noreferrer")}
    >
      Open Discord
      <ExternalLink className="h-4 w-4 opacity-70" />
    </Button>
  );
}
