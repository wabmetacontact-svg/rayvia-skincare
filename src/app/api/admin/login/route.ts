import { NextResponse } from "next/server";
import { verifyCredentials, unauthorized } from "@/lib/admin-auth";
import { createAdminToken } from "@/lib/admin-tokens";

export const dynamic = "force-dynamic";

/**
 * Admin login endpoint.
 *
 * Accepts credentials from (in order of preference):
 *   1. JSON body  { username, password }   — proxy-safe, always delivered
 *   2. Authorization: Basic <base64>
 *   3. x-admin-username / x-admin-password headers
 *
 * On success returns a signed session token that the client must send on
 * subsequent admin requests via either `Authorization: Bearer <token>` or
 * `?admin_token=<token>` query parameter (the latter is proxy-safe).
 */
export async function POST(req: Request) {
  let username = "";
  let password = "";

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      username = String(body?.username ?? "");
      password = String(body?.password ?? "");
    } catch {
      /* ignore malformed body */
    }
  }

  if (!username || !password) {
    const auth = req.headers.get("authorization") || "";
    const m = auth.match(/^Basic\s+(.+)$/i);
    if (m) {
      try {
        const decoded = Buffer.from(m[1], "base64").toString("utf8");
        const idx = decoded.indexOf(":");
        if (idx >= 0) {
          username = username || decoded.slice(0, idx);
          password = password || decoded.slice(idx + 1);
        }
      } catch {
        /* ignore */
      }
    }
  }

  if (!username || !password) {
    username = username || (req.headers.get("x-admin-username") || "");
    password = password || (req.headers.get("x-admin-password") || "");
  }

  if (!verifyCredentials(username, password)) return unauthorized();

  const token = createAdminToken();
  return NextResponse.json({
    success: true,
    token,
    username: username.trim(),
    message: "Login successful.",
  });
}
