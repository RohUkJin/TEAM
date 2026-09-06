import crypto from "crypto";

const TOKEN_BYTES = 32;

/** 브라우저/메일로 전달할 원문 토큰 (DB에 저장하지 않음) */
export function generateVerificationToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("base64url");
}

/** DB 저장용 SHA-256 hex 해시 */
export function hashVerificationToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken, "utf8").digest("hex");
}
