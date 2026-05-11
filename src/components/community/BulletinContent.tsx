import React from "react";
import { cn } from "@/lib/utils";

type Token =
  | { type: "text"; value: string }
  | { type: "link"; href: string; children: string };

function normalizeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function trimBareUrlEnd(raw: string): string {
  return raw.replace(/[.,;:!?)]+$/, "");
}

const MD_LINK = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
const BARE_URL = /\bhttps?:\/\/[^\s<>"']+/gi;

function tokenizeBareUrls(segment: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(BARE_URL.source, BARE_URL.flags);
  while ((m = re.exec(segment)) !== null) {
    if (m.index > last) {
      tokens.push({ type: "text", value: segment.slice(last, m.index) });
    }
    const raw = m[0];
    const cleaned = trimBareUrlEnd(raw);
    const href = normalizeHttpUrl(cleaned);
    if (href) {
      tokens.push({ type: "link", href, children: cleaned });
    } else {
      tokens.push({ type: "text", value: raw });
    }
    last = m.index + raw.length;
  }
  if (last < segment.length) {
    tokens.push({ type: "text", value: segment.slice(last) });
  }
  return tokens;
}

function mergeAdjacentText(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (const t of tokens) {
    const prev = out[out.length - 1];
    if (t.type === "text" && prev?.type === "text") {
      prev.value += t.value;
    } else {
      out.push(t.type === "text" ? { ...t } : { ...t });
    }
  }
  return out;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const md = new RegExp(MD_LINK.source, MD_LINK.flags);
  while ((m = md.exec(text)) !== null) {
    if (m.index > last) {
      tokens.push(...tokenizeBareUrls(text.slice(last, m.index)));
    }
    const href = normalizeHttpUrl(m[2]);
    if (href) {
      const label = m[1].length > 0 ? m[1] : href;
      tokens.push({ type: "link", href, children: label });
    } else {
      tokens.push({ type: "text", value: m[0] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    tokens.push(...tokenizeBareUrls(text.slice(last)));
  }
  return mergeAdjacentText(tokens);
}

const linkClass =
  "font-medium text-primary underline underline-offset-2 hover:opacity-90 break-all";

/**
 * Renders bulletin text with clickable links: paste `https://...` URLs, or use
 * markdown-style `[link text](https://example.com)`.
 */
export function BulletinContent({
  text,
  className,
  linkKeyPrefix,
}: {
  text: string;
  className?: string;
  linkKeyPrefix: string;
}) {
  const tokens = tokenize(text);
  return (
    <span className={cn("whitespace-pre-wrap break-words", className)}>
      {tokens.map((t, i) =>
        t.type === "text" ? (
          <React.Fragment key={`${linkKeyPrefix}-t-${i}`}>{t.value}</React.Fragment>
        ) : (
          <a
            key={`${linkKeyPrefix}-a-${i}`}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {t.children}
          </a>
        )
      )}
    </span>
  );
}
