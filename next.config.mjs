import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Required for OpenNext → Cloudflare Workers bundle. */
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  /** Lets OpenNext resolve Prisma for the workerd runtime (see opennext.js.org/cloudflare/howtos/db). */
  serverExternalPackages: [
    "@prisma/client",
    ".prisma/client",
    "@prisma/adapter-neon",
    "@prisma/adapter-pg",
    "@neondatabase/serverless",
    "pg",
    "bcryptjs",
    "nodemailer",
    "@aws-sdk/client-s3",
  ],
  serverComponentsExternalPackages: [
    "@prisma/client",
    ".prisma/client",
    "@prisma/adapter-neon",
    "@prisma/adapter-pg",
    "@neondatabase/serverless",
    "pg",
    "bcryptjs",
    "nodemailer",
    "@aws-sdk/client-s3",
  ],
};

export default nextConfig;
