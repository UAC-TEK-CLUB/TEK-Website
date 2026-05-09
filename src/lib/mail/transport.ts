import nodemailer, { type Transporter } from "nodemailer";

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let cachedTransport: Transporter | null = null;

function getTransport(): Transporter | null {
  if (cachedTransport) return cachedTransport;

  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
  return cachedTransport;
}

export function getAppUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function sendMail(message: MailMessage): Promise<void> {
  const transport = getTransport();
  const from = process.env.EMAIL_FROM ?? "UAC TEK Club <noreply@tek.club>";

  if (!transport) {
    // Dev fallback: nothing wired up yet, just log so the developer can see it.
    // Officers can still hand off the link manually from the admin dialog.
    console.log("\n[email] (no SMTP configured — logging instead)");
    console.log(`  From:    ${from}`);
    console.log(`  To:      ${message.to}`);
    console.log(`  Subject: ${message.subject}`);
    console.log(`  ${message.text.split("\n").join("\n  ")}\n`);
    return;
  }

  try {
    await transport.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  } catch (err) {
    // Never let a flaky mail server break a status change. The DB update has
    // already committed; surface the failure in logs so an officer can re-send.
    console.error("[email] sendMail failed:", err);
  }
}
