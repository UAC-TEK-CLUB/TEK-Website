import type { z } from "zod";

export type ActionResult<T = void> =
  | ({ ok: true } & (T extends void ? object : { data: T }))
  | { ok: false; error: string };

/** First field error message from a failed Zod safeParse, or a fallback string. */
export function firstZodFieldError<S extends z.ZodTypeAny>(
  schema: S,
  raw: unknown,
  fallback = "Please check your input and try again."
): string {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return "";
  const fe = parsed.error.flatten().fieldErrors;
  for (const key of Object.keys(fe)) {
    const msg = fe[key as keyof typeof fe]?.[0];
    if (msg) return msg;
  }
  return fallback;
}
