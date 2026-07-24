import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  return (
    process.env.RAYVIA_ADMIN_TOKEN_SECRET ||
    "rayvia-default-token-secret-change-in-production"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function b64urlEncode(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}

function b64urlDecode(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

export function createAdminToken(): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `v1.${exp}`;
  const sig = sign(payload);
  return b64urlEncode(`${payload}.${sig}`);
}

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = b64urlDecode(token);
    const parts = decoded.split(".");
    if (parts.length !== 3 || parts[0] !== "v1") return false;
    const [, expStr, sig] = parts;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || exp < Date.now()) return false;
    const expected = sign(`v1.${expStr}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
