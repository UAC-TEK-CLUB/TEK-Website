import { Navbar } from "@/components/layout/Navbar";
import { MemberSidebar } from "@/components/layout/MemberSidebar";
import { requireOfficer } from "@/lib/permissions";

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  await requireOfficer(1);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-6 px-0 py-0 md:px-6">
        <MemberSidebar isOfficer />
        <main className="flex-1 px-4 py-6 md:px-0">{children}</main>
      </div>
    </div>
  );
}
