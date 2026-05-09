import type { VideoProvider } from "@prisma/client";

const YT_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
  "youtu.be",
]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

export type ParsedVideo = {
  provider: VideoProvider;
  embedUrl: string;
  thumbnailUrl: string | null;
  watchUrl: string;
};

export function parseVideoUrl(rawUrl: string): ParsedVideo {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return {
      provider: "OTHER",
      embedUrl: rawUrl,
      thumbnailUrl: null,
      watchUrl: rawUrl,
    };
  }

  if (YT_HOSTS.has(url.hostname)) {
    const id =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.pathname.startsWith("/embed/")
          ? url.pathname.slice("/embed/".length)
          : url.searchParams.get("v");
    if (id) {
      return {
        provider: "YOUTUBE",
        embedUrl: `https://www.youtube.com/embed/${id}`,
        thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        watchUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
  }

  if (VIMEO_HOSTS.has(url.hostname)) {
    const idMatch = url.pathname.match(/\/(\d+)/);
    if (idMatch?.[1]) {
      return {
        provider: "VIMEO",
        embedUrl: `https://player.vimeo.com/video/${idMatch[1]}`,
        thumbnailUrl: null,
        watchUrl: rawUrl,
      };
    }
  }

  return {
    provider: "OTHER",
    embedUrl: rawUrl,
    thumbnailUrl: null,
    watchUrl: rawUrl,
  };
}
