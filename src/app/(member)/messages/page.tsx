import { requireMember } from "@/lib/permissions";
import { listChatThreads } from "@/server/actions/community";
import { ChatList } from "@/components/community/ChatList";

export default async function MessagesPage() {
  const me = await requireMember();
  const threads = await listChatThreads(me.memberId);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">Direct messages with other members.</p>
      </div>
      <ChatList threads={threads} />
    </div>
  );
}
