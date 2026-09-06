const RESERVED_PATH_SEGMENTS = new Set([
  "admin",
  "api",
  "blogs",
  "login",
  "logout",
  "me",
  "new",
  "posts",
  "register",
  "settings",
  "t",
  "team",
  "u",
  "user",
  "users",
  "verify-email",
  "write",
]);

/** 표시용 닉네임: 한글·영문 허용 */
const NICKNAME_REGEX = /^[a-z가-힣][a-z0-9가-힣_]{1,19}$/;
/** URL용 사용자 slug: ASCII 영문·숫자만 */
const URL_SLUG_REGEX = /^[a-z][a-z0-9]{1,19}$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isReservedPathSegment(value: string): boolean {
  return RESERVED_PATH_SEGMENTS.has(value.toLowerCase());
}

/** @deprecated use isReservedPathSegment */
export function isReservedNickname(nickname: string): boolean {
  return isReservedPathSegment(nickname);
}

export function normalizeNickname(raw: string): string {
  return raw.trim().normalize("NFC").toLowerCase();
}

export function normalizeUrlSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

export function assertValidNickname(raw: string): string {
  const nickname = normalizeNickname(raw);
  if (!NICKNAME_REGEX.test(nickname)) {
    throw new Error(
      "nickname must be 2-20 chars: start with a letter or Hangul, then letters/Hangul/digits/_",
    );
  }
  return nickname;
}

export function isAsciiUrlSlugCandidate(value: string): boolean {
  return URL_SLUG_REGEX.test(normalizeUrlSlug(value));
}

export function assertValidUrlSlug(raw: string): string {
  const slug = normalizeUrlSlug(raw);
  if (!URL_SLUG_REGEX.test(slug)) {
    throw new Error(
      "urlSlug must be 2-20 chars: start with a letter, then a-z, 0-9",
    );
  }
  if (isReservedPathSegment(slug)) {
    throw new Error("urlSlug is reserved");
  }
  return slug;
}

export function slugifyName(input: string): string {
  const ascii = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return ascii.length >= 2 ? ascii : "team";
}

export function assertValidSlug(raw: string): string {
  const slug = raw.trim().toLowerCase();
  if (!SLUG_REGEX.test(slug) || slug.length < 2 || slug.length > 64) {
    throw new Error("slug must be 2-64 chars: a-z, 0-9, hyphen");
  }
  if (isReservedPathSegment(slug)) {
    throw new Error("slug is reserved");
  }
  return slug;
}

export {
  NICKNAME_REGEX,
  URL_SLUG_REGEX,
  SLUG_REGEX,
  RESERVED_PATH_SEGMENTS,
  RESERVED_PATH_SEGMENTS as RESERVED_NICKNAMES,
};
