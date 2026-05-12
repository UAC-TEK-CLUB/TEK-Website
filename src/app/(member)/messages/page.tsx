import { requireMember } from "@/lib/permissions";
import { listChatThreads } from "@/server/actions/community";
import { ChatList } from "@/components/community/ChatList";
import { DiscordInviteBanner } from "@/components/community/DiscordInviteBanner";

export default async function MessagesPage() {
  const me = await requireMember();
  const threads = await listChatThreads(me.memberId);
  const discordInviteUrl = process.env.DISCORD_INVITE_URL;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Direct messages with other members. Group chat lives on Discord when configured below.
        </p>
      </div>
      <DiscordInviteBanner inviteUrl={discordInviteUrl} />
      <ChatList threads={threads} />
    </div>
  );
}
