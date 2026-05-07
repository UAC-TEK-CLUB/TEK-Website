import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export function isOfficer(user: { memberType?: string; adminAccessLevel?: number } | null) {
  return !!user && user.memberType === "OFFICER" && (user.adminAccessLevel ?? 0) >= 1;
}
