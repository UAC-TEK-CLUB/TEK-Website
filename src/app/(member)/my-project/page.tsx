import { redirect } from "next/navigation";

/** Lab spotlights are edited from `/labs/[labId]/console`. */
export default function MyProjectRedirectPage() {
  redirect("/labs");
}
