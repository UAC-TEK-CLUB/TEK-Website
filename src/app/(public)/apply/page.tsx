import { ApplicationForm } from "@/components/recruitment/ApplicationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplyPage() {
  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader>
          <CardTitle>Apply to TEK Club</CardTitle>
          <CardDescription>
            All current undergraduates are welcome. Once an officer approves your
            application, we&apos;ll email login credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm />
        </CardContent>
      </Card>
    </div>
  );
}
