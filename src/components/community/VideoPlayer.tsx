"use client";

import { ExternalLink } from "lucide-react";
import { parseVideoUrl } from "@/lib/videoEmbed";
import { Button } from "@/components/ui/button";

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const parsed = parseVideoUrl(url);

  if (parsed.provider === "OTHER") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border bg-muted/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          This video is hosted somewhere we can&apos;t embed. Click below to open it.
        </p>
        <Button asChild>
          <a href={parsed.watchUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> Open video
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-md border bg-black">
      <iframe
        src={parsed.embedUrl}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
