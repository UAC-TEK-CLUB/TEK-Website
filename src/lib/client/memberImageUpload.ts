import type { MemberImageUploadPrefix } from "@/lib/constants";

export type { MemberImageUploadPrefix };

export async function uploadMemberImageFile(
  file: File,
  prefix: MemberImageUploadPrefix = "gallery"
): Promise<string> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("prefix", prefix);
  const res = await fetch("/api/member-upload", { method: "POST", body: fd });
  const data: unknown = await res.json().catch(() => ({}));
  const err =
    typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
      ? (data as { error: string }).error
      : null;
  if (!res.ok) {
    throw new Error(err || "Upload failed");
  }
  if (
    typeof data !== "object" ||
    data === null ||
    !("url" in data) ||
    typeof (data as { url: unknown }).url !== "string"
  ) {
    throw new Error("Invalid upload response");
  }
  return (data as { url: string }).url;
}
