import { ApplicationForm } from "@/components/recruitment/ApplicationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplyPage() {
  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader>
          <CardTitle>Apply to UAC TEK Club</CardTitle>
          <CardDescription>
            All current undergraduates are welcome. Once your application is approved,
            we&apos;ll email an account activation link so you can choose your own
            username and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm />
        </CardContent>
      </Card>
    </div>
  );
}
