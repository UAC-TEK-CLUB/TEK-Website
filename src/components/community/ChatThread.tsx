"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/server/actions/community";
import { cn, formatDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { ChatMessage } from "@prisma/client";

type Peer = { memberId: string; firstName: string; lastName: string };

export function ChatThread({
  meId,
  peer,
  messages,
}: {
  meId: string;
  peer: Peer;
  messages: ChatMessage[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");

  function onSend() {
    if (!draft.trim()) return;
    const content = draft;
    setDraft("");
    startTransition(async () => {
      await sendMessage({ receiverId: peer.memberId, content });
      router.refresh();
    });
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-md border">
      <div className="border-b p-3">
        <p className="font-semibold">
          {peer.firstName} {peer.lastName}
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Start the conversation!
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === meId;
          return (
            <div key={m.messageId} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                  mine ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {formatDateTime(m.sentAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={pending}
        />
        <Button onClick={onSend} disabled={pending || !draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
