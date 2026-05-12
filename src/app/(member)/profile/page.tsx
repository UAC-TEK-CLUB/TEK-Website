import { requireMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/identity/ProfileForm";
import { ChangePasswordForm } from "@/components/identity/ChangePasswordForm";

export default async function ProfilePage() {
  const user = await requireMember();
  const member = await prisma.member.findUnique({
    where: { memberId: user.memberId },
    include: {
      officerProfile: true,
      regularProfile: true,
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
              username: member.username,
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
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
