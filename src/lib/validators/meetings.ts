import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z.string().min(2).max(120),
  scheduledAt: z.coerce.date(),
  type: z.enum(["GENERAL", "WORKSHOP", "HACKATHON", "SOCIAL", "OFFICER_ONLY"]),
  location: z.string().max(200).optional().nullable(),
});

export const updateMeetingSchema = createMeetingSchema.extend({
  meetingId: z.string().min(1),
});

export const recordAttendanceSchema = z.object({
  meetingId: z.string().min(1),
  memberId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "EXCUSED", "LATE"]),
});
