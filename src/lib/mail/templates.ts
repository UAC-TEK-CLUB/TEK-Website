import { getAppUrl, type MailMessage } from "./transport";

const BRAND = "UAC TEK Club";

function wrap(title: string, body: string) {
  return `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f4f4f5;padding:24px;color:#0a0a0a;">
  <table role="presentation" align="center" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;">
    <tr><td style="padding:24px 28px 8px 28px;">
      <h1 style="margin:0 0 12px 0;font-size:20px;">${title}</h1>
      ${body}
      <p style="margin-top:32px;font-size:12px;color:#71717a;">— ${BRAND}</p>
    </td></tr>
  </table>
</body></html>`;
}

export function acceptanceEmail(opts: {
  to: string;
  firstName: string;
  registerPath: string;
  autoAccepted: boolean;
  /** Resend after approval when the applicant never finished /register. */
  reminder?: boolean;
}): MailMessage {
  const url = `${getAppUrl()}${opts.registerPath}`;
  const lead = opts.reminder
    ? "Your application is already approved. Use the link below to finish creating your account."
    : opts.autoAccepted
      ? "Welcome aboard! Your application was approved automatically based on your major."
      : "Good news — an officer just approved your application.";

  const text = [
    `Hi ${opts.firstName},`,
    "",
    lead,
    "",
    "Use this one-time link to set up your account:",
    url,
    "",
    "The link becomes invalid as soon as you use it.",
    "",
    `— ${BRAND}`,
  ].join("\n");

  const title = opts.reminder
    ? `Finish your ${BRAND} account, ${opts.firstName}`
    : `Welcome to ${BRAND}, ${opts.firstName}!`;

  const html = wrap(
    title,
    `<p style="margin:0 0 16px 0;">${lead}</p>
     <p style="margin:0 0 24px 0;">Use the button below to set up your account. The link is one-time use.</p>
     <p style="margin:0 0 24px 0;">
       <a href="${url}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Set up my account</a>
     </p>
     <p style="margin:0;font-size:12px;color:#71717a;word-break:break-all;">If the button doesn't work, paste this URL into your browser:<br/><a href="${url}" style="color:#71717a;">${url}</a></p>`
  );

  return {
    to: opts.to,
    subject: opts.reminder
      ? `${BRAND} — finish your account setup`
      : `Your ${BRAND} application was approved`,
    text,
    html,
  };
}

export function pendingEmail(opts: { to: string; firstName: string }): MailMessage {
  const text = [
    `Hi ${opts.firstName},`,
    "",
    `Thanks for applying to ${BRAND}! We've received your application and an officer will review it within a week.`,
    "",
    "If you're approved, you'll get a follow-up email with a link to set up your account.",
    "",
    `— ${BRAND}`,
  ].join("\n");

  const html = wrap(
    "We received your application",
    `<p style="margin:0 0 16px 0;">Hi ${opts.firstName},</p>
     <p style="margin:0 0 16px 0;">Thanks for applying to ${BRAND}. An officer will review your application within a week.</p>
     <p style="margin:0;">If you're approved, you'll get a follow-up email with a link to set up your account.</p>`
  );

  return {
    to: opts.to,
    subject: `${BRAND} — application received`,
    text,
    html,
  };
}

export function rejectionEmail(opts: { to: string; firstName: string }): MailMessage {
  const text = [
    `Hi ${opts.firstName},`,
    "",
    `Thank you for your interest in ${BRAND}. After reviewing your application, the officers have decided not to move forward at this time.`,
    "",
    "We appreciate the time you took to apply and wish you the best in your studies.",
    "",
    `— ${BRAND}`,
  ].join("\n");

  const html = wrap(
    `An update on your ${BRAND} application`,
    `<p style="margin:0 0 16px 0;">Hi ${opts.firstName},</p>
     <p style="margin:0 0 16px 0;">Thank you for your interest in ${BRAND}. After reviewing your application, the officers have decided not to move forward at this time.</p>
     <p style="margin:0;">We appreciate the time you took to apply and wish you the best in your studies.</p>`
  );

  return {
    to: opts.to,
    subject: `${BRAND} — application update`,
    text,
    html,
  };
}

export function accountRecoveryOtpEmail(opts: {
  to: string;
  firstName: string;
  code: string;
  intro: string;
}): MailMessage {
  const text = [
    `Hi ${opts.firstName},`,
    "",
    opts.intro,
    "",
    `Your verification code: ${opts.code}`,
    "",
    "This code expires in 15 minutes. If you did not request it, you can ignore this email.",
    "",
    `— ${BRAND}`,
  ].join("\n");

  const html = wrap(
    `${BRAND} verification code`,
    `<p style="margin:0 0 16px 0;">Hi ${opts.firstName},</p>
     <p style="margin:0 0 16px 0;">${opts.intro}</p>
     <p style="margin:0 0 8px 0;font-size:14px;color:#52525b;">Your verification code</p>
     <p style="margin:0 0 24px 0;font-size:28px;font-weight:700;letter-spacing:0.2em;font-family:ui-monospace,monospace;">${opts.code}</p>
     <p style="margin:0;font-size:12px;color:#71717a;">Expires in 15 minutes. If you did not request this, you can ignore this message.</p>`
  );

  return {
    to: opts.to,
    subject: `${BRAND} — your verification code`,
    text,
    html,
  };
}
