import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(2).max(10000),
});

export const uploadPhotoSchema = z.object({
  url: z.string().url(),
  caption: z.string().max(280).optional().nullable(),
});

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export const scheduleTutoringSchema = z.object({
  studentId: z.string().min(1),
  subject: z.string().min(2).max(120),
  scheduledAt: z.coerce.date(),
  durationMins: z.coerce.number().int().min(15).max(240).default(60),
});

export const recordHealthLogSchema = z.object({
  metricName: z.string().min(1).max(80),
  metricValue: z.coerce.number(),
});
