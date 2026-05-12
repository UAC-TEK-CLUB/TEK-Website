import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(2).max(10000),
  /** Club-wide (null) = president/supervisor only; set = lab announcement for that lab. */
  labId: z.string().min(1).optional().nullable(),
});

const imageUrlOrPath = z
  .string()
  .min(1)
  .refine(
    (s) => /^https?:\/\//i.test(s) || s.startsWith("/"),
    "Must be an http(s) URL or a path starting with /"
  );

export const uploadPhotoSchema = z.object({
  url: imageUrlOrPath,
  caption: z.string().max(280).optional().nullable(),
});

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export const addVideoSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  videoUrl: z.string().url(),
});
export type AddVideoInput = z.infer<typeof addVideoSchema>;

export const recordHealthLogSchema = z.object({
  metricName: z.string().min(1).max(80),
  metricValue: z.coerce.number(),
});
