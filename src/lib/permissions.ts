import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { OfficerRole } from "@prisma/client";

export async function requireMember() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** President or supervisor — full site administration (same powers). */
const SITE_ADMIN_ROLES: OfficerRole[] = ["PRESIDENT", "SUPERVISOR"];

export function isSiteAdmin(
  user: { memberType?: string; officerRole?: OfficerRole | null } | null
): boolean {
  return (
    !!user &&
    user.memberType === "OFFICER" &&
    !!user.officerRole &&
    SITE_ADMIN_ROLES.includes(user.officerRole)
  );
}

/** @deprecated Prefer requireSiteAdmin for admin routes; kept for legacy numeric checks if needed. */
export async function requireOfficer(minLevel = 1) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (
    session.user.memberType !== "OFFICER" ||
    (session.user.adminAccessLevel ?? 0) < minLevel
  ) {
    redirect("/dashboard?forbidden=1");
  }
  return session.user;
}

export async function requireExecutive() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isSiteAdmin(session.user)) {
    redirect("/dashboard?forbidden=1");
  }
  return session.user;
}

/** Alias: president and supervisor share full admin access. */
export async function requireSiteAdmin() {
  return requireExecutive();
}

/** Only the president (single-role checks, e.g. ceremonial defaults). */
export async function requirePresident() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (
    session.user.memberType !== "OFFICER" ||
    session.user.officerRole !== "PRESIDENT"
  ) {
    redirect("/dashboard?forbidden=1");
  }
  return session.user;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export function isOfficer(
  user: { memberType?: string; adminAccessLevel?: number } | null
) {
  return !!user && user.memberType === "OFFICER" && (user.adminAccessLevel ?? 0) >= 1;
}

export function isExecutive(
  user: { memberType?: string; officerRole?: OfficerRole | null } | null
) {
  return isSiteAdmin(user);
}

export function isPresident(
  user: { memberType?: string; officerRole?: OfficerRole | null } | null
) {
  return (
    !!user && user.memberType === "OFFICER" && user.officerRole === "PRESIDENT"
  );
}
