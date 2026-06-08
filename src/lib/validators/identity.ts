import { z } from "zod";
import { emailField, entityId, officerRoleEnum, personName } from "@/lib/validators/common";

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "root",
  "support",
  "help",
  "tek",
  "system",
  "null",
  "undefined",
  "api",
]);

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(24, "Username must be at most 24 characters.")
  .regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores.")
  .transform((s) => s.toLowerCase())
  .refine((s) => !RESERVED_USERNAMES.has(s), "That username is reserved.");

/** Allowed specials: ! @ # $ % ^ & * */
const PASSWORD_COMPLEXITY_MSG =
  "Choose a different password. It must be at least 8 characters and include a capital letter, a number, and a special character (! @ # $ % ^ & *).";

export const registrationPasswordSchema = z
  .string()
  .max(128, "Password is too long.")
  .refine(
    (val) =>
      val.length >= 8 &&
      /[A-Z]/.test(val) &&
      /[0-9]/.test(val) &&
      /[!@#$%^&*]/.test(val),
    { message: PASSWORD_COMPLEXITY_MSG }
  );

export const completeRegistrationSchema = z.object({
  token: entityId,
  username: usernameSchema,
  password: registrationPasswordSchema,
  expectedGraduation: z.coerce.date(),
});
export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>;

export const updateProfileSchema = z.object({
  firstName: personName,
  lastName: personName,
  email: emailField,
  expectedGraduation: z.coerce.date().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const promoteOfficerSchema = z.object({
  memberId: entityId,
  officerRole: officerRoleEnum.default("LEADER"),
});

export const setOfficerRoleSchema = z.object({
  memberId: entityId,
  officerRole: officerRoleEnum,
});

export const setMembershipStatusSchema = z.object({
  memberId: entityId,
  status: z.enum(["ACTIVE", "INACTIVE", "ALUMNI", "SUSPENDED"]),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: registrationPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "New password and confirmation must match.",
  });
