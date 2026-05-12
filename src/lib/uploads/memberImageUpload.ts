import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export function isS3Configured(): boolean {
  return !!(
    process.env.S3_BUCKET &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_PUBLIC_URL
  );
}

function extensionForMime(mime: string): string | undefined {
  return ALLOWED.get(mime);
}

function s3Client(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: !!process.env.S3_ENDPOINT,
  });
}

export type MemberImageUploadPrefix = "gallery" | "spotlight" | "lab-announcement";

export type MemberImageUploadInput = {
  memberId: string;
  buffer: Buffer;
  contentType: string;
  prefix: MemberImageUploadPrefix;
};

/**
 * Stores image for a signed-in member. Uses S3 when configured; otherwise in development
 * writes under `public/uploads/...` so `/uploads/...` is served by Next.
 */
export async function uploadMemberImageBuffer(input: MemberImageUploadInput): Promise<string> {
  const ext = extensionForMime(input.contentType);
  if (!ext) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed.");
  }

  const key = `${input.prefix}/${input.memberId}/${randomUUID()}.${ext}`;

  if (isS3Configured()) {
    const bucket = process.env.S3_BUCKET!;
    await s3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.contentType,
      })
    );
    const base = process.env.S3_PUBLIC_URL!.replace(/\/$/, "");
    return `${base}/${key}`;
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error(
      "Image uploads require S3 (or compatible) configuration. Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_PUBLIC_URL."
    );
  }

  const cwd = process.cwd();
  const dir = path.join(cwd, "public", "uploads", input.prefix, input.memberId);
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const fullPath = path.join(dir, filename);
  await writeFile(fullPath, input.buffer);
  return `/uploads/${input.prefix}/${input.memberId}/${filename}`;
}
