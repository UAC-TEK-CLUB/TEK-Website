import { redirect } from "next/navigation";

/** Lab spotlights moved to each lab’s manage page (`/member/labs/[labId]/manage`). */
export default function MyProjectRedirectPage() {
  redirect("/labs");
}
