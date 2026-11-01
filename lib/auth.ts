import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hash(p: string) {
  const s = randomBytes(16).toString("hex");
  return s + ":" + scryptSync(p, s, 64).toString("hex");
}

export function check(p: string, h: string) {
  const [s, k] = h.split(":");
  if (!s || !k) return false;
  const a = Buffer.from(k, "hex");
  const b = scryptSync(p, s, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}
