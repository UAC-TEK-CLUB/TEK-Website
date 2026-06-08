/** Centralized environment variable access (Worker secrets + local .env). */

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set.");
  }
  return secret;
}

export function getAppUrl(): string {
  return (
    process.env.APP_URL?.replace(/\/$/, "") ??
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function getDiscordInviteUrl(): string | undefined {
  const url = process.env.DISCORD_INVITE_URL?.trim();
  return url || undefined;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
};

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return null;
  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    password: process.env.SMTP_PASSWORD ?? "",
    from: process.env.EMAIL_FROM ?? "UAC TEK Club <noreply@example.com>",
  };
}

export function getS3Config() {
  return {
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    publicUrl: process.env.S3_PUBLIC_URL,
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "auto",
  };
}
