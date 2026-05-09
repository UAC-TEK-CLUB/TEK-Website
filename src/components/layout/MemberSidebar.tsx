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

const memberLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/labs", label: "Labs", icon: FlaskConical },
  { href: "/proposals/new", label: "Propose a lab", icon: FlaskConical },
  { href: "/bulletin", label: "Bulletin", icon: Newspaper },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/tutoring", label: "Tutoring Videos", icon: GraduationCap },
];

const officerLinks = [
  { href: "/admin/proposals", label: "Proposals", icon: Shield },
  { href: "/admin/members", label: "Members", icon: Shield },
  { href: "/admin/meetings", label: "Manage Meetings", icon: Shield },
  { href: "/admin/health", label: "Health", icon: Shield },
];

const executiveLinks = [
  { href: "/admin/applicants", label: "Applicants", icon: Crown },
];

export function MemberSidebar({
  isOfficer,
  isExecutive,
}: {
  isOfficer: boolean;
  isExecutive: boolean;
}) {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-muted/20 md:block">
      <nav className="flex flex-col gap-1 p-4">
        <p className="px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">
          Member
        </p>
        {memberLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}

        {isExecutive && (
          <>
            <p className="mt-4 px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">
              Executive
            </p>
            {executiveLinks.map(({ href, label, icon: Icon }) => (
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

        {isOfficer && (
          <>
            <p className="mt-4 px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">
              Officer
            </p>
            {officerLinks.map(({ href, label, icon: Icon }) => (
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
