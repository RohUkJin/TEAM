import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function resolveCookieSecure(isDevelopment: boolean): boolean {
  const raw = process.env.COOKIE_SECURE;
  if (raw === "true") return true;
  if (raw === "false") return false;
  // 기본: development=false(로컬 HTTP), production=true(HTTPS 전제)
  return !isDevelopment;
}

function resolveCookieSameSite(): "lax" | "strict" | "none" {
  const raw = (process.env.COOKIE_SAMESITE ?? "lax").toLowerCase();
  if (raw === "lax" || raw === "strict" || raw === "none") {
    return raw;
  }
  throw new Error(
    `Invalid COOKIE_SAMESITE="${process.env.COOKIE_SAMESITE}". Use lax|strict|none`,
  );
}

function resolveEmailTransport(): "console" | "resend" {
  const raw = (process.env.EMAIL_TRANSPORT ?? "console").toLowerCase();
  if (raw === "console" || raw === "resend") {
    return raw;
  }
  throw new Error(
    `Invalid EMAIL_TRANSPORT="${process.env.EMAIL_TRANSPORT}". Use console|resend`,
  );
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const isDevelopment = nodeEnv === "development";
const isProduction = nodeEnv === "production";

const cookieSecure = resolveCookieSecure(isDevelopment);
const cookieSameSite = resolveCookieSameSite();
const emailTransport = resolveEmailTransport();
const resendApiKey = process.env.RESEND_API_KEY?.trim() ?? "";
const emailFrom =
  process.env.EMAIL_FROM?.trim() || "TEAM <onboarding@resend.dev>";

// 배포(HTTPS) 전제: production에서 Secure=false 는 실수 가능성이 커서 기동을 막는다.
// 로컬 HTTP 테스트가 필요하면 NODE_ENV=development 또는 COOKIE_SECURE 미설정(기본 false)을 사용.
if (isProduction && !cookieSecure) {
  throw new Error(
    'Invalid cookie config: NODE_ENV=production requires COOKIE_SECURE=true (HTTPS). Set COOKIE_SECURE=true in production env.',
  );
}

if (cookieSameSite === "none" && !cookieSecure) {
  throw new Error(
    "Invalid cookie config: SameSite=None requires Secure=true (HTTPS)",
  );
}

if (isProduction && emailTransport !== "resend") {
  throw new Error(
    'Invalid email config: NODE_ENV=production requires EMAIL_TRANSPORT=resend',
  );
}

if (emailTransport === "resend" && !resendApiKey) {
  throw new Error(
    "Invalid email config: EMAIL_TRANSPORT=resend requires RESEND_API_KEY",
  );
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: required("FRONTEND_ORIGIN"),
  databaseUrl: required("DATABASE_URL"),
  /** 이메일 인증 토큰 만료(시간). 기본 24시간 */
  emailVerificationExpiresHours: Number(
    process.env.EMAIL_VERIFICATION_EXPIRES_HOURS ?? 24,
  ),
  emailTransport,
  resendApiKey,
  emailFrom,
  /** console 전송일 때만 가입 응답에 토큰 노출 */
  exposeDevVerificationToken: emailTransport === "console",
  jwtSecret: required("JWT_SECRET"),
  /** Access Token 만료(초). 기본 15분 */
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 900),
  /** Refresh Token 만료(초). 기본 7일 */
  refreshTokenExpiresInSeconds: Number(
    process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 60 * 24 * 7,
  ),
  cookieSecure,
  cookieSameSite,
  isDevelopment,
  isProduction,
};
