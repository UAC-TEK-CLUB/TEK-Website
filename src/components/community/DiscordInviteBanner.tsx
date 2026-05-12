import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function DiscordInviteBanner({ inviteUrl }: { inviteUrl: string | undefined }) {
  const raw = inviteUrl?.trim();
  if (!raw || !isSafeHttpUrl(raw)) return null;

  return (
    <Card className="border-indigo-200/70 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/25">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Club Discord</CardTitle>
        <CardDescription>
          Site messages are one-to-one. For group chat, voice, and announcements, join the TEK
          Discord server.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3 pt-0">
        <Button asChild variant="secondary" className="gap-2">
          <a href={raw} target="_blank" rel="noopener noreferrer">
            Open Discord
            <ExternalLink className="h-4 w-4 opacity-70" />
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">
          Link opens in a new tab. Ask an officer if you need a fresh invite.
        </p>
      </CardContent>
    </Card>
  );
}
