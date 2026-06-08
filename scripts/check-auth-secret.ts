import { encode, decode } from "@auth/core/jwt";

async function main() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Set AUTH_SECRET from .env");

  const token = await encode({
    token: {
      sub: "cmp15xnse0000q901a4tp9tji",
      memberId: "cmp15xnse0000q901a4tp9tji",
      memberType: "OFFICER",
      adminAccessLevel: 5,
      officerRole: "PRESIDENT",
    },
    secret,
    salt: "authjs.session-token",
  });

  const res = await fetch("https://tek-website.kojh0918.workers.dev/dashboard", {
    headers: { Cookie: `__Secure-authjs.session-token=${token}` },
    redirect: "manual",
  });

  const body = await res.text();
  const ok =
    res.status === 200 &&
    !body.includes("Application error") &&
    (body.includes("Welcome back") || body.includes("dashboard"));
  console.log(ok ? "AUTH_SECRET matches production (dashboard 200)" : `Mismatch or error: HTTP ${res.status}`);
  if (!ok && body.includes("digest")) {
    const m = body.match(/digest":(\d+)/);
    if (m) console.log("digest", m[1]);
  }

  await decode({ token, secret, salt: "authjs.session-token" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
