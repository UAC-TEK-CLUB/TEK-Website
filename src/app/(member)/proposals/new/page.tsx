import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LabProposalForm } from "@/components/labs/LabProposalForm";

export default function NewProposalPage() {
  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Propose a new lab</CardTitle>
          <CardDescription>
            Officers will review your pitch. Approved proposals automatically become real labs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LabProposalForm />
        </CardContent>
      </Card>
    </div>
  );
}
