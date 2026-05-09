import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { OfficerRole } from "@prisma/client";

export async function requireMember() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

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

const EXECUTIVE_ROLES: OfficerRole[] = ["PRESIDENT", "SUPERVISOR"];

export async function requireExecutive() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (
    session.user.memberType !== "OFFICER" ||
    !session.user.officerRole ||
    !EXECUTIVE_ROLES.includes(session.user.officerRole)
  ) {
    redirect("/dashboard?forbidden=1");
  }
  return session.user;
}

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
  return (
    !!user &&
    user.memberType === "OFFICER" &&
    !!user.officerRole &&
    EXECUTIVE_ROLES.includes(user.officerRole)
  );
}

export function isPresident(
  user: { memberType?: string; officerRole?: OfficerRole | null } | null
) {
  return (
    !!user && user.memberType === "OFFICER" && user.officerRole === "PRESIDENT"
  );
}
