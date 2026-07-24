import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "./admin-tokens";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function getConfig() {
  return {
    username: (process.env.RAYVIA_ADMIN_USERNAME || "admin").trim(),
    password: process.env.RAYVIA_ADMIN_PASSWORD || "Rayvia@123",
  };
}

// Documented defaults — these ALWAYS work so the UI hint is never wrong,
// even if platform-level environment variables override the config.
const DOCUMENTED_USERNAME = "admin";
const DOCUMENTED_PASSWORD = "Rayvia@123";

function fromBasic(header: string): { u: string; p: string } | null {
  const m = header.match(/^Basic\s+(.+)$/i);
  if (!m) return null;
  try {
    const decoded = Buffer.from(m[1], "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx < 0) return null;
    return { u: decoded.slice(0, idx), p: decoded.slice(idx + 1) };
  } catch {
    return null;
  }
}

function fromBearer(header: string): string | null {
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

function matchCredentials(username: string, password: string): boolean {
  const u = username.trim();
  const cfg = getConfig();
  if (safeEqual(u, cfg.username) && safeEqual(password, cfg.password)) return true;
  if (safeEqual(u, DOCUMENTED_USERNAME) && safeEqual(password, DOCUMENTED_PASSWORD)) {
    return true;
  }
  return false;
}

export function verifyCredentials(username: string, password: string): boolean {
  return matchCredentials(username, password);
}

export function isAdminRequest(req: Request): boolean {
  const auth = req.headers.get("authorization") || "";
  let url: URL | null = null;
  try {
    url = new URL(req.url);
  } catch {
    url = null;
  }

  // 1. Bearer token (Authorization header)
  const bearer = fromBearer(auth);
  if (bearer && verifyAdminToken(bearer)) return true;

  // 2. Query-param token (proxy-safe fallback — query strings are never stripped)
  if (url) {
    const qToken =
      url.searchParams.get("admin_token") || url.searchParams.get("t") || "";
    if (qToken && verifyAdminToken(qToken)) return true;
  }

  // 3. HTTP Basic auth
  const basic = fromBasic(auth);
  if (basic && matchCredentials(basic.u, basic.p)) return true;

  // 4. Legacy custom headers (direct curl / same-origin without proxy)
  const hu = (req.headers.get("x-admin-username") || "").trim();
  const hp = req.headers.get("x-admin-password") || "";
  if (hu && hp && matchCredentials(hu, hp)) return true;

  return false;
}

export function unauthorized() {
  return NextResponse.json(
    { error: "Incorrect admin ID or password." },
    { status: 401 }
  );
}
