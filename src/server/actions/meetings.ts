"use server";

import { prisma } from "@/lib/prisma";
import { requireMember, requireSiteAdmin, isSiteAdmin } from "@/lib/permissions";
import { revalidateMeeting, revalidateMeetingAttendance } from "@/lib/revalidate";
import {
  createMeetingSchema,
  recordAttendanceSchema,
  updateMeetingSchema,
} from "@/lib/validators/meetings";

export async function createMeeting(raw: unknown) {
  await requireSiteAdmin();
  const data = createMeetingSchema.parse(raw);
  const meeting = await prisma.meeting.create({
    data: {
      title: data.title,
      scheduledAt: data.scheduledAt,
      type: data.type,
      location: data.location ?? null,
      notes: data.notes ?? null,
    },
  });
  revalidateMeeting(meeting.meetingId);
  return meeting;
}

export async function updateMeeting(raw: unknown) {
  await requireSiteAdmin();
  const data = updateMeetingSchema.parse(raw);
  await prisma.meeting.update({
    where: { meetingId: data.meetingId },
    data: {
      title: data.title,
      scheduledAt: data.scheduledAt,
      type: data.type,
      location: data.location ?? null,
      notes: data.notes ?? null,
    },
  });
  revalidateMeeting(data.meetingId);
}

export async function deleteMeeting(meetingId: string) {
  await requireSiteAdmin();
  await prisma.meeting.delete({ where: { meetingId } });
  revalidateMeeting(meetingId);
}

export async function recordAttendance(raw: unknown) {
  const me = await requireMember();
  const data = recordAttendanceSchema.parse(raw);

  const canRecordOthers = isSiteAdmin(me);
  if (data.memberId !== me.memberId && !canRecordOthers) {
    throw new Error("You can only record your own attendance.");
  }

  await prisma.attendanceRecord.upsert({
    where: {
      meetingId_memberId: {
        meetingId: data.meetingId,
        memberId: data.memberId,
      },
    },
    create: {
      meetingId: data.meetingId,
      memberId: data.memberId,
      attendanceStatus: data.status,
    },
    update: { attendanceStatus: data.status },
  });

  revalidateMeetingAttendance(data.meetingId);
}

export async function bulkMarkAbsent(meetingId: string) {
  await requireSiteAdmin();
  const allMembers = await prisma.member.findMany({
    where: { membershipStatus: "ACTIVE" },
    select: { memberId: true },
  });

  await prisma.$transaction(
    allMembers.map((m) =>
      prisma.attendanceRecord.upsert({
        where: { meetingId_memberId: { meetingId, memberId: m.memberId } },
        create: {
          meetingId,
          memberId: m.memberId,
          attendanceStatus: "ABSENT",
        },
        update: {},
      })
    )
  );

  revalidateMeetingAttendance(meetingId);
}

export async function listUpcomingMeetings() {
  return prisma.meeting.findMany({
    where: { scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function listAllMeetings() {
  return prisma.meeting.findMany({
    orderBy: { scheduledAt: "desc" },
    include: { _count: { select: { attendance: true } } },
  });
}

export async function getAttendanceStats(memberId: string) {
  const records = await prisma.attendanceRecord.findMany({
    where: { memberId },
  });
  const total = records.length;
  const present = records.filter((r) => r.attendanceStatus === "PRESENT").length;
  const late = records.filter((r) => r.attendanceStatus === "LATE").length;
  const absent = records.filter((r) => r.attendanceStatus === "ABSENT").length;
  return { total, present, late, absent };
}
