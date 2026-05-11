import { createHash, randomInt, timingSafeEqual } from "crypto";

const OTP_TTL_MS = 15 * 60 * 1000;
export const RECOVERY_MAX_OTP_ATTEMPTS = 8;
export const PASSWORD_TICKET_TTL_MS = 45 * 60 * 1000;

function recoverySecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not configured.");
  return s;
}

/** Normalize user-entered OTP to six digits (leading zeros). */
export function normalizeOtpInput(code: string): string {
  const digits = code.replace(/\D/g, "").slice(0, 6);
  return digits.padStart(6, "0");
}

export function hashRecoveryOtp(code: string): string {
  const normalized = normalizeOtpInput(code);
  return createHash("sha256")
    .update(`${recoverySecret()}:recovery-otp:${normalized}`)
    .digest("hex");
}

export function generateSixDigitOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function verifyRecoveryOtp(code: string, codeHash: string): boolean {
  const h = hashRecoveryOtp(code);
  if (h.length !== codeHash.length) return false;
  try {
    return timingSafeEqual(Buffer.from(h, "hex"), Buffer.from(codeHash, "hex"));
  } catch {
    return false;
  }
}

export function recoveryOtpExpiresAt(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

export function passwordTicketExpiresAt(): Date {
  return new Date(Date.now() + PASSWORD_TICKET_TTL_MS);
}
