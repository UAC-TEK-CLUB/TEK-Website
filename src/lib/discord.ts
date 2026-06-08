/** Normalize club Discord invite env to a canonical https URL. */
export function normalizeDiscordInviteUrl(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      if (u.hostname === "discord.gg" && u.pathname.length > 1) {
        const code = u.pathname.replace(/^\//, "").split("/")[0];
        return code ? `https://discord.com/invite/${code}` : null;
      }
      if (u.hostname === "discord.com" && u.pathname.startsWith("/invite/")) {
        return `https://discord.com${u.pathname}`;
      }
      return u.toString();
    } catch {
      return null;
    }
  }

  const code = trimmed.replace(/^discord\.gg\//i, "").split(/[/?#]/)[0];
  return code ? `https://discord.com/invite/${code}` : null;
}

export function getDiscordInviteUrl(): string | null {
  return normalizeDiscordInviteUrl(process.env.DISCORD_INVITE_URL);
}
