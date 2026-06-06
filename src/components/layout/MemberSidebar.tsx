import type { OfficerRole } from "@prisma/client";
import Link from "next/link";
import {
  CalendarDays,
  Crown,
  FlaskConical,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Shield,
  UserCircle,
} from "lucide-react";

function memberNavLinks(meetingsHref: string) {
  return [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Profile", icon: UserCircle },
    { href: meetingsHref, label: "Meetings", icon: CalendarDays },
    { href: "/labs", label: "Labs", icon: FlaskConical },
    { href: "/proposals/new", label: "Propose a lab", icon: FlaskConical },
    { href: "/bulletin", label: "Bulletin", icon: Newspaper },
    { href: "/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/tutoring", label: "Tutoring Videos", icon: GraduationCap },
  ];
}

const siteAdminLinks = [
  { href: "/admin/proposals", label: "Proposals", icon: Shield },
  { href: "/admin/labs", label: "Labs", icon: Shield },
  { href: "/admin/projects", label: "Lab spotlights", icon: Shield },
  { href: "/admin/members", label: "Members", icon: Shield },
  { href: "/admin/health", label: "Health", icon: Shield },
];

function administrationLinksFor(officerRole: OfficerRole | null) {
  if (officerRole !== "SUPERVISOR") return siteAdminLinks;
  return siteAdminLinks.filter(
    (link) => link.href !== "/admin/proposals" && link.href !== "/admin/projects"
  );
}

const executiveOnlyLinks = [{ href: "/admin/applicants", label: "Applicants", icon: Crown }];

export type LedLab = { labId: string; labName: string };

export function MemberSidebar({
  isSiteAdmin,
  officerRole,
  ledLabs,
}: {
  /** Shared admin sidebar visibility (President primary admin; Supervisor oversight scope). */
  isSiteAdmin: boolean;
  /** Used to trim Administration links supervisors do not use. */
  officerRole: OfficerRole | null;
  ledLabs: LedLab[];
}) {
  const meetingsHref = isSiteAdmin ? "/admin/meetings" : "/meetings";

  return (
    <aside className="hidden w-56 shrink-0 border-r bg-muted/20 md:block">
      <nav className="flex flex-col gap-1 p-4">
        <p className="px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">Member</p>
        {memberNavLinks(meetingsHref).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}

        {ledLabs.length > 0 && (
          <>
            <p className="mt-4 px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">
              My lab
            </p>
            {ledLabs.map((lab) => (
              <Link
                key={lab.labId}
                href={`/labs/${lab.labId}/console`}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <FlaskConical className="h-4 w-4" /> {lab.labName}
              </Link>
            ))}
          </>
        )}

        {isSiteAdmin && (
          <>
            <p className="mt-4 px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">
              Applicants
            </p>
            {executiveOnlyLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}

            <p className="mt-4 px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">
              Administration
            </p>
            {administrationLinksFor(officerRole).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
