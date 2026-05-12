import { z } from "zod";

function trimToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

export const upsertLeaderProjectSchema = z.object({
  labId: z.string().min(1),
  title: z.string().min(2).max(120),
  description: z.string().min(20).max(3000),
  photoUrl: z
    .string()
    .min(1)
    .refine(
      (s) => /^https?:\/\//i.test(s) || s.startsWith("/"),
      "Must be an http(s) URL or a path starting with /"
    ),
  websiteUrl: z
    .string()
    .max(2048)
    .transform(trimToNull)
    .pipe(z.union([z.null(), z.string().url("Enter a valid http(s) URL or leave blank")])),
});

export const deleteLeaderProjectSchema = z.object({
  projectId: z.string().min(1),
});
