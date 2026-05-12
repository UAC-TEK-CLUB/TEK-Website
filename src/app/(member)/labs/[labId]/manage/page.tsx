import { redirect } from "next/navigation";

/** @deprecated Use `/labs/[labId]/console` — kept for bookmarks and old links. */
export default function LabManageRedirectPage({
  params,
}: {
  params: { labId: string };
}) {
  redirect(`/labs/${params.labId}/console`);
}
