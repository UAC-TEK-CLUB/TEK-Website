import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  MEMBER_IMAGE_MAX_BYTES,
  MEMBER_IMAGE_UPLOAD_PREFIX_SET,
  type MemberImageUploadPrefix,
} from "@/lib/constants";
import { uploadMemberImageBuffer } from "@/lib/uploads/memberImageUpload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const prefixRaw = form.get("prefix");
  const prefix: MemberImageUploadPrefix =
    typeof prefixRaw === "string" && MEMBER_IMAGE_UPLOAD_PREFIX_SET.has(prefixRaw)
      ? (prefixRaw as MemberImageUploadPrefix)
      : "gallery";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > MEMBER_IMAGE_MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const url = await uploadMemberImageBuffer({
      memberId: session.user.memberId,
      buffer: buf,
      contentType: file.type || "application/octet-stream",
      prefix,
    });
    return NextResponse.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
