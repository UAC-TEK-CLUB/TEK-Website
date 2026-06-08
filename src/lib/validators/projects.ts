import { z } from "zod";
import { entityId, imageUrlOrPath } from "@/lib/validators/common";

function trimToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

export const upsertLeaderProjectSchema = z.object({
  labId: entityId,
  title: z.string().min(2).max(120),
  description: z.string().min(20).max(3000),
  photoUrl: imageUrlOrPath,
  websiteUrl: z
    .string()
    .max(2048)
    .transform(trimToNull)
    .pipe(z.union([z.null(), z.string().url("Enter a valid http(s) URL or leave blank")])),
});

export const deleteLeaderProjectSchema = z.object({
  projectId: entityId,
});
