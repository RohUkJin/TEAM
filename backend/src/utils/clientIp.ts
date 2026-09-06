import type { Request } from "express";

/** Express 요청에서 클라이언트 IP를 추출한다. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw =
    (typeof forwarded === "string"
      ? forwarded.split(",")[0]
      : Array.isArray(forwarded)
        ? forwarded[0]
        : undefined) ??
    req.socket.remoteAddress ??
    "";

  const ip = raw.trim();
  if (!ip) return "unknown";

  // IPv4-mapped IPv6 (:ffff:127.0.0.1)
  if (ip.startsWith("::ffff:")) {
    return ip.slice(7);
  }
  return ip;
}
