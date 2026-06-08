import { MemberSidebar, type LedLab } from "@/components/layout/MemberSidebar";
import type { OfficerRole } from "@prisma/client";

export function MemberShell({
  isSiteAdmin,
  officerRole,
  ledLabs,
  alerts,
  children,
}: {
  isSiteAdmin: boolean;
  officerRole: OfficerRole | null;
  ledLabs: LedLab[];
  alerts?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex flex-1 gap-6 px-0 py-0 md:px-6">
        <MemberSidebar
          isSiteAdmin={isSiteAdmin}
          officerRole={officerRole}
          ledLabs={ledLabs}
        />
        <main className="flex-1 px-4 py-6 md:px-0">{children}</main>
      </div>
      {alerts}
    </div>
  );
}
