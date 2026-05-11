"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail/transport";
import { accountRecoveryOtpEmail } from "@/lib/mail/templates";
import {
  confirmFindUsernameSchema,
  confirmPasswordResetSchema,
  completePasswordTicketSchema,
  requestFindUsernameSchema,
  requestPasswordResetSchema,
} from "@/lib/validators/recovery";
import { registrationPasswordSchema } from "@/lib/validators/identity";
import {
  generateSixDigitOtp,
  hashRecoveryOtp,
  passwordTicketExpiresAt,
  recoveryOtpExpiresAt,
  RECOVERY_MAX_OTP_ATTEMPTS,
  verifyRecoveryOtp,
} from "@/lib/recoveryOtp";
import type { RecoveryPurpose } from "@prisma/client";

async function invalidateOpenChallenges(purpose: RecoveryPurpose, universityId: string, usernameNorm?: string | null) {
  await prisma.accountRecoveryCode.deleteMany({
    where: {
      purpose,
      universityId,
      usedAt: null,
      ...(usernameNorm != null && purpose === "PASSWORD_RESET" ? { usernameNorm } : {}),
    },
  });
}

export async function requestFindUsername(raw: unknown) {
  const data = requestFindUsernameSchema.parse(raw);
  const universityId = data.universityId.trim();

  const member = await prisma.member.findUnique({
    where: { universityId },
    select: { email: true, firstName: true, universityId: true, membershipStatus: true },
  });
  if (!member || member.membershipStatus === "SUSPENDED") {
    throw new Error("No member account found for that student ID.");
  }

  await invalidateOpenChallenges("REVEAL_USERNAME", universityId);

  const plain = generateSixDigitOtp();
  const codeHash = hashRecoveryOtp(plain);
  const row = await prisma.accountRecoveryCode.create({
    data: {
      purpose: "REVEAL_USERNAME",
      codeHash,
      universityId,
      expiresAt: recoveryOtpExpiresAt(),
    },
  });

  await sendMail(
    accountRecoveryOtpEmail({
      to: member.email,
      firstName: member.firstName,
      code: plain,
      intro: "You asked to look up your TEK Club website username. Enter this code on the site to continue.",
    })
  );

  return { challengeId: row.accountRecoveryCodeId };
}

export async function confirmFindUsername(raw: unknown) {
  const data = confirmFindUsernameSchema.parse(raw);

  const challenge = await prisma.accountRecoveryCode.findFirst({
    where: {
      accountRecoveryCodeId: data.challengeId,
      purpose: "REVEAL_USERNAME",
      usedAt: null,
    },
  });
  if (!challenge || challenge.expiresAt < new Date()) {
    throw new Error("This code has expired or is invalid. Start over from the student ID step.");
  }
  if (challenge.attemptCount >= RECOVERY_MAX_OTP_ATTEMPTS) {
    throw new Error("Too many incorrect attempts. Request a new code.");
  }

  if (!verifyRecoveryOtp(data.code, challenge.codeHash)) {
    await prisma.accountRecoveryCode.update({
      where: { accountRecoveryCodeId: challenge.accountRecoveryCodeId },
      data: { attemptCount: { increment: 1 } },
    });
    throw new Error("That code does not match. Check the email we sent and try again.");
  }

  const member = await prisma.member.findUnique({
    where: { universityId: challenge.universityId },
    select: { username: true, membershipStatus: true },
  });
  if (!member || member.membershipStatus === "SUSPENDED") {
    throw new Error("Account no longer exists.");
  }

  await prisma.accountRecoveryCode.update({
    where: { accountRecoveryCodeId: challenge.accountRecoveryCodeId },
    data: { usedAt: new Date() },
  });

  return { username: member.username };
}

export async function requestPasswordReset(raw: unknown) {
  const data = requestPasswordResetSchema.parse(raw);
  const universityId = data.universityId.trim();
  const usernameNorm = data.username.trim().toLowerCase();

  const member = await prisma.member.findFirst({
    where: { universityId, username: usernameNorm },
    select: {
      email: true,
      firstName: true,
      username: true,
      universityId: true,
      membershipStatus: true,
    },
  });
  if (!member || member.membershipStatus === "SUSPENDED") {
    throw new Error("Username and student ID do not match any account. Check both and try again.");
  }

  await invalidateOpenChallenges("PASSWORD_RESET", universityId, usernameNorm);

  const plain = generateSixDigitOtp();
  const codeHash = hashRecoveryOtp(plain);
  const row = await prisma.accountRecoveryCode.create({
    data: {
      purpose: "PASSWORD_RESET",
      codeHash,
      universityId,
      usernameNorm,
      expiresAt: recoveryOtpExpiresAt(),
    },
  });

  await sendMail(
    accountRecoveryOtpEmail({
      to: member.email,
      firstName: member.firstName,
      code: plain,
      intro: "You asked to reset your TEK Club password. Enter this code on the site to continue.",
    })
  );

  return { challengeId: row.accountRecoveryCodeId };
}

export async function confirmPasswordReset(raw: unknown) {
  const data = confirmPasswordResetSchema.parse(raw);

  const challenge = await prisma.accountRecoveryCode.findFirst({
    where: {
      accountRecoveryCodeId: data.challengeId,
      purpose: "PASSWORD_RESET",
      usedAt: null,
    },
  });
  if (!challenge || challenge.expiresAt < new Date()) {
    throw new Error("This code has expired or is invalid. Start over from the beginning.");
  }
  if (!challenge.usernameNorm) {
    throw new Error("Invalid recovery record.");
  }
  if (challenge.attemptCount >= RECOVERY_MAX_OTP_ATTEMPTS) {
    throw new Error("Too many incorrect attempts. Request a new code.");
  }

  if (!verifyRecoveryOtp(data.code, challenge.codeHash)) {
    await prisma.accountRecoveryCode.update({
      where: { accountRecoveryCodeId: challenge.accountRecoveryCodeId },
      data: { attemptCount: { increment: 1 } },
    });
    throw new Error("That code does not match. Check the email we sent and try again.");
  }

  const member = await prisma.member.findFirst({
    where: {
      universityId: challenge.universityId,
      username: challenge.usernameNorm,
    },
    select: { memberId: true, username: true, membershipStatus: true },
  });
  if (!member || member.membershipStatus === "SUSPENDED") {
    throw new Error("Account no longer exists.");
  }

  const tempHash = await bcrypt.hash(member.username, 10);
  const token = randomBytes(32).toString("hex");
  const expiresAt = passwordTicketExpiresAt();

  await prisma.$transaction(async (tx) => {
    await tx.accountRecoveryCode.update({
      where: { accountRecoveryCodeId: challenge.accountRecoveryCodeId },
      data: { usedAt: new Date() },
    });
    await tx.passwordChangeTicket.updateMany({
      where: { memberId: member.memberId, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.member.update({
      where: { memberId: member.memberId },
      data: { passwordHash: tempHash },
    });
    await tx.passwordChangeTicket.create({
      data: {
        memberId: member.memberId,
        token,
        expiresAt,
      },
    });
  });

  revalidatePath("/admin/members");

  return { setPasswordPath: `/account/set-new-password?token=${token}` as const };
}

export async function completePasswordChangeTicket(raw: unknown) {
  const data = completePasswordTicketSchema.parse(raw);

  if (data.password !== data.confirmPassword) {
    throw new Error("New password and confirmation do not match.");
  }

  const pw = registrationPasswordSchema.safeParse(data.password);
  if (!pw.success) {
    throw new Error(pw.error.issues[0]?.message ?? "Invalid password.");
  }

  const ticket = await prisma.passwordChangeTicket.findUnique({
    where: { token: data.token },
    include: { member: true },
  });
  if (!ticket || ticket.usedAt || ticket.expiresAt < new Date()) {
    throw new Error("This link has expired or was already used. Use Forgot password to start again.");
  }

  const passwordHash = await bcrypt.hash(pw.data, 10);

  await prisma.$transaction([
    prisma.member.update({
      where: { memberId: ticket.memberId },
      data: { passwordHash },
    }),
    prisma.passwordChangeTicket.update({
      where: { passwordChangeTicketId: ticket.passwordChangeTicketId },
      data: { usedAt: new Date() },
    }),
  ]);

  return { username: ticket.member.username };
}
