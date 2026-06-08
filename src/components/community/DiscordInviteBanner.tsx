import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DiscordOpenButton } from "@/components/community/DiscordOpenButton";
import { normalizeDiscordInviteUrl } from "@/lib/discord";

export function DiscordInviteBanner({ inviteUrl }: { inviteUrl: string | undefined }) {
  const url = normalizeDiscordInviteUrl(inviteUrl);
  if (!url) return null;

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
        <DiscordOpenButton inviteUrl={url} />
        <p className="text-xs text-muted-foreground">
          Link opens in a new tab. Ask an officer if you need a fresh invite.
        </p>
      </CardContent>
    </Card>
  );
}
