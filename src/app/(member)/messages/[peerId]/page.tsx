import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/permissions";
import { markRead } from "@/server/actions/community";
import { ChatThread } from "@/components/community/ChatThread";

export default async function ChatThreadPage({
  params,
}: {
  params: { peerId: string };
}) {
  const me = await requireMember();
  if (params.peerId === me.memberId) notFound();

  const peer = await prisma.member.findUnique({
    where: { memberId: params.peerId },
    select: { memberId: true, firstName: true, lastName: true },
  });
  if (!peer) notFound();

  await markRead(peer.memberId);

  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: me.memberId, receiverId: peer.memberId },
        { senderId: peer.memberId, receiverId: me.memberId },
      ],
    },
    orderBy: { sentAt: "asc" },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Conversation</h1>
      <ChatThread meId={me.memberId} peer={peer} messages={messages} />
    </div>
  );
}
