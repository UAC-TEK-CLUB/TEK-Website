"use server";

import { revalidatePath } from "next/cache";
import type { OfficerRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireMember, requireSiteAdmin, isSiteAdmin } from "@/lib/permissions";
import { canManageLabApplications, canViewLabAnnouncements } from "@/lib/labAccess";
import {
  addVideoSchema,
  createPostSchema,
  sendMessageSchema,
  uploadPhotoSchema,
} from "@/lib/validators/community";
import { parseVideoUrl } from "@/lib/videoEmbed";
import { canModerateGalleryDeletes } from "@/lib/galleryAccess";

// ----- Bulletin Board -----

/** Latest bulletin posts for members (e.g. home / dashboard). Pinned first. */
export async function listBulletinHighlights(limit = 5) {
  return prisma.bulletinPost.findMany({
    where: { labId: null },
    take: limit,
    orderBy: [{ pinned: "desc" }, { postedAt: "desc" }],
    include: {
      author: { select: { firstName: true, lastName: true } },
      lab: { select: { labName: true } },
    },
  });
}

/**
 * Lab leader announcements for the public lab page.
 * Returns `null` if the viewer must not see this lab’s feed; otherwise an array (possibly empty).
 */
export async function getLabAnnouncementsForLabPage(
  labId: string,
  user: { memberId: string; memberType: string; officerRole?: OfficerRole | null } | null
) {
  if (!user || !(await canViewLabAnnouncements(user, labId))) return null;
  return prisma.bulletinPost.findMany({
    where: { labId },
    orderBy: [{ postedAt: "desc" }],
    include: {
      author: { select: { firstName: true, lastName: true, memberId: true } },
      lab: { select: { labName: true } },
    },
  });
}

export async function createPost(raw: unknown) {
  const me = await requireMember();
  const data = createPostSchema.parse(raw);
  const labId = data.labId?.trim() || null;

  if (!labId) {
    if (!isSiteAdmin(me)) {
      throw new Error("Only the president or supervisor can post club-wide announcements.");
    }
    const post = await prisma.bulletinPost.create({
      data: {
        authorId: me.memberId,
        title: data.title,
        content: data.content,
        labId: null,
      },
    });
    revalidatePath("/bulletin");
    revalidatePath("/");
    revalidatePath("/dashboard");
    return post;
  }

  if (!(await canManageLabApplications(me, labId))) {
    throw new Error("You can only post announcements for a lab you lead (or as president/supervisor).");
  }

  const post = await prisma.bulletinPost.create({
    data: {
      authorId: me.memberId,
      title: data.title,
      content: data.content,
      labId,
    },
  });
  revalidatePath("/bulletin");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/labs/${labId}`);
    revalidatePath(`/member/labs/${labId}/manage`);
    return post;
}

export async function updatePost(postId: string, raw: unknown) {
  const me = await requireMember();
  const data = createPostSchema.parse(raw);
  const post = await prisma.bulletinPost.findUnique({ where: { postId } });
  if (!post) throw new Error("Post not found.");
  if (post.authorId !== me.memberId && !isSiteAdmin(me)) {
    throw new Error("You can only edit your own posts.");
  }
  await prisma.bulletinPost.update({
    where: { postId },
    data: { title: data.title, content: data.content },
  });
  revalidatePath("/bulletin");
  revalidatePath("/");
  revalidatePath("/dashboard");
  if (post.labId) revalidatePath(`/labs/${post.labId}`);
}

export async function deletePost(postId: string) {
  const me = await requireMember();
  const post = await prisma.bulletinPost.findUnique({ where: { postId } });
  if (!post) return;
  if (post.authorId !== me.memberId && !isSiteAdmin(me)) {
    throw new Error("You can only delete your own posts.");
  }
  const labId = post.labId;
  await prisma.bulletinPost.delete({ where: { postId } });
  revalidatePath("/bulletin");
  revalidatePath("/");
  revalidatePath("/dashboard");
  if (labId) revalidatePath(`/labs/${labId}`);
}

export async function togglePinPost(postId: string) {
  await requireSiteAdmin();
  const post = await prisma.bulletinPost.findUnique({ where: { postId } });
  if (!post) return;
  if (post.labId) {
    throw new Error("Lab announcements cannot be pinned on the club board.");
  }
  await prisma.bulletinPost.update({
    where: { postId },
    data: { pinned: !post.pinned },
  });
  revalidatePath("/bulletin");
  revalidatePath("/");
  revalidatePath("/dashboard");
}

// ----- Gallery -----

export async function uploadPhoto(raw: unknown) {
  const me = await requireMember();
  const data = uploadPhotoSchema.parse(raw);
  const photo = await prisma.galleryPhoto.create({
    data: {
      uploaderId: me.memberId,
      url: data.url,
      caption: data.caption ?? null,
    },
  });
  revalidatePath("/gallery");
  return photo;
}

export async function deletePhoto(photoId: string) {
  const me = await requireMember();
  const photo = await prisma.galleryPhoto.findUnique({ where: { photoId } });
  if (!photo) return;
  if (photo.uploaderId !== me.memberId && !(await canModerateGalleryDeletes(me))) {
    throw new Error("You can only remove your own uploads.");
  }
  await prisma.galleryPhoto.delete({ where: { photoId } });
  revalidatePath("/gallery");
}

// ----- Chat -----

export async function sendMessage(raw: unknown) {
  const me = await requireMember();
  const data = sendMessageSchema.parse(raw);
  if (data.receiverId === me.memberId) throw new Error("You can't message yourself.");
  await prisma.chatMessage.create({
    data: {
      senderId: me.memberId,
      receiverId: data.receiverId,
      content: data.content,
    },
  });
  revalidatePath(`/messages/${data.receiverId}`);
  revalidatePath("/messages");
}

export async function markRead(peerId: string) {
  const me = await requireMember();
  await prisma.chatMessage.updateMany({
    where: {
      senderId: peerId,
      receiverId: me.memberId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function listChatThreads(memberId: string) {
  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [{ senderId: memberId }, { receiverId: memberId }],
    },
    orderBy: { sentAt: "desc" },
    include: {
      sender: { select: { memberId: true, firstName: true, lastName: true } },
      receiver: { select: { memberId: true, firstName: true, lastName: true } },
    },
  });

  const threadsByPeer = new Map<
    string,
    {
      peer: { memberId: string; firstName: string; lastName: string };
      lastMessage: string;
      lastAt: Date;
      unread: number;
    }
  >();

  for (const m of messages) {
    const peer = m.senderId === memberId ? m.receiver : m.sender;
    if (!threadsByPeer.has(peer.memberId)) {
      threadsByPeer.set(peer.memberId, {
        peer,
        lastMessage: m.content,
        lastAt: m.sentAt,
        unread: 0,
      });
    }
    if (m.receiverId === memberId && !m.readAt) {
      const t = threadsByPeer.get(peer.memberId)!;
      t.unread += 1;
    }
  }

  return Array.from(threadsByPeer.values());
}

// ----- Tutoring Video Library -----

export async function addTutoringVideo(raw: unknown) {
  const officer = await requireSiteAdmin();
  const data = addVideoSchema.parse(raw);
  const parsed = parseVideoUrl(data.videoUrl);

  const video = await prisma.tutoringVideo.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      videoUrl: data.videoUrl,
      provider: parsed.provider,
      uploaderId: officer.memberId,
    },
  });
  revalidatePath("/tutoring");
  return video;
}

export async function deleteTutoringVideo(videoId: string) {
  await requireSiteAdmin();
  await prisma.tutoringVideo.delete({ where: { videoId } });
  revalidatePath("/tutoring");
}

export async function listTutoringVideos() {
  return prisma.tutoringVideo.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploader: true },
  });
}
