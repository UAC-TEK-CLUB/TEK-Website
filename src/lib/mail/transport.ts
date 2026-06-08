import nodemailer, { type Transporter } from "nodemailer";
import { getAppUrl, getSmtpConfig, isProduction } from "@/lib/env";

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let cachedTransport: Transporter | null = null;

function getTransport(): Transporter | null {
  if (cachedTransport) return cachedTransport;

  const smtp = getSmtpConfig();
  if (!smtp) return null;

  cachedTransport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: smtp.user && smtp.password ? { user: smtp.user, pass: smtp.password } : undefined,
  });
  return cachedTransport;
}

export { getAppUrl };

export async function sendMail(message: MailMessage): Promise<void> {
  const transport = getTransport();
  const smtp = getSmtpConfig();
  const from = smtp?.from ?? "UAC TEK Club <noreply@tek.club>";

  if (!transport) {
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
    if (!isProduction()) {
      console.log(`[email] sent to ${message.to} (subject: ${message.subject})`);
    }
  } catch (err) {
    console.error("[email] sendMail failed:", err);
  }
}
