import { requireMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/identity/ProfileForm";
import { MemberCard } from "@/components/identity/MemberCard";
import { Separator } from "@/components/ui/separator";

export default async function ProfilePage() {
  const user = await requireMember();
  const member = await prisma.member.findUnique({
    where: { memberId: user.memberId },
    include: {
      officerProfile: true,
      regularProfile: true,
      mentor: { include: { officerProfile: true } },
      mentees: true,
    },
  });
  if (!member) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your contact info and graduation year.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
              expectedGraduation: member.regularProfile?.expectedGraduation
                ?.toISOString()
                .slice(0, 10),
            }}
            isRegular={member.memberType === "REGULAR"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mentorship</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">My mentor</p>
            {member.mentor ? (
              <MemberCard member={member.mentor} />
            ) : (
              <p className="text-sm text-muted-foreground">No mentor assigned.</p>
            )}
          </div>
          <Separator />
          <div>
            <p className="mb-2 text-sm font-medium">My mentees ({member.mentees.length})</p>
            {member.mentees.length === 0 ? (
              <p className="text-sm text-muted-foreground">You aren&apos;t mentoring anyone yet.</p>
            ) : (
              <div className="space-y-2">
                {member.mentees.map((m) => (
                  <MemberCard key={m.memberId} member={m} />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
