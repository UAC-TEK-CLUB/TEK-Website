/** Visitor tracking cookie set in middleware and read when submitting applications. */
export const VISITOR_COOKIE = "tek_visitor_id";

/** Allowed prefixes for member image uploads (gallery, spotlight, lab announcements). */
export const MEMBER_IMAGE_UPLOAD_PREFIXES = [
  "gallery",
  "spotlight",
  "lab-announcement",
] as const;

export type MemberImageUploadPrefix = (typeof MEMBER_IMAGE_UPLOAD_PREFIXES)[number];

export const MEMBER_IMAGE_UPLOAD_PREFIX_SET = new Set<string>(MEMBER_IMAGE_UPLOAD_PREFIXES);

/** Maximum upload size for member images (5 MB). */
export const MEMBER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
