"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UserCheck, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPresidentMemberAlerts,
  type PresidentMemberAlert,
} from "@/server/actions/recruitment";

const STORAGE_KEY = "tek_president_member_alerts_seen_at";
const POLL_MS = 45_000;
const INITIAL_LOOKBACK_MS = 24 * 60 * 60 * 1000;

function readSeenAt(): string {
  if (typeof window === "undefined") return new Date().toISOString();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  const initial = new Date(Date.now() - INITIAL_LOOKBACK_MS).toISOString();
  localStorage.setItem(STORAGE_KEY, initial);
  return initial;
}

function writeSeenAt(iso: string) {
  localStorage.setItem(STORAGE_KEY, iso);
}

function maxIso(a: string, b: string) {
  return a > b ? a : b;
}

export function PresidentMemberAlerts() {
  const [alerts, setAlerts] = useState<PresidentMemberAlert[]>([]);

  const dismiss = useCallback((alert: PresidentMemberAlert) => {
    setAlerts((prev) => prev.filter((item) => item.id !== alert.id));
    const prevSeen = localStorage.getItem(STORAGE_KEY) ?? alert.at;
    writeSeenAt(maxIso(prevSeen, alert.at));
  }, []);

  const dismissAll = useCallback(() => {
    setAlerts((prev) => {
      if (prev.length === 0) return prev;
      const latest = prev.reduce((max, item) => maxIso(max, item.at), prev[0].at);
      writeSeenAt(maxIso(latest, new Date().toISOString()));
      return [];
    });
  }, []);

  const refresh = useCallback(async (since: string) => {
    try {
      const incoming = await getPresidentMemberAlerts(since);
      if (incoming.length === 0) return;
      setAlerts((prev) => {
        const known = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        for (const item of incoming) {
          if (!known.has(item.id)) merged.push(item);
        }
        return merged.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
      });
    } catch {
      /* ignore polling errors */
    }
  }, []);

  useEffect(() => {
    const since = readSeenAt();
    void refresh(since);

    const timer = window.setInterval(() => {
      const current = localStorage.getItem(STORAGE_KEY) ?? since;
      void refresh(current);
    }, POLL_MS);

    return () => window.clearInterval(timer);
  }, [refresh]);

  if (alerts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 p-4 sm:p-0"
      aria-live="polite"
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto animate-in slide-in-from-bottom-4 fade-in rounded-lg border border-emerald-200/80 bg-background p-4 shadow-lg dark:border-emerald-900/50"
        >
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {alert.type === "member_joined" ? (
                <UserPlus className="h-4 w-4" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{alert.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{alert.detail}</p>
              <div className="mt-3 flex items-center gap-2">
                <Button asChild size="sm" variant="outline" className="h-8">
                  <Link href={alert.href}>View</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={() => dismiss(alert)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Dismiss notification"
              onClick={() => dismiss(alert)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      {alerts.length > 1 && (
        <div className="pointer-events-auto flex justify-end">
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={dismissAll}>
            Dismiss all
          </Button>
        </div>
      )}
    </div>
  );
}
