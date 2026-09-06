export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
/** 영문·숫자 각각 1자 이상 */
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export type FieldErrors = {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  nickname?: string;
  urlSlug?: string;
};

const NICKNAME_REGEX = /^[a-z가-힣][a-z0-9가-힣_]{1,19}$/;
const URL_SLUG_REGEX = /^[a-z][a-z0-9]{1,19}$/;

export function getPasswordValidationError(password: string): string | undefined {
  if (!password) {
    return "비밀번호를 입력해 주세요";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다`;
  }
  if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
    return "영문과 숫자를 각각 1자 이상 포함해 주세요";
  }
  return undefined;
}

export function previewUrlSlug(nickname: string, urlSlug: string): string {
  const slug = urlSlug.trim().toLowerCase();
  if (slug) return slug;
  const nick = nickname.trim().normalize("NFC").toLowerCase();
  if (URL_SLUG_REGEX.test(nick)) return nick;
  return "user…";
}

/** Backend와 동일한 규칙의 클라이언트 UX validation (최종 판단은 API) */
export function validateRegisterInput(input: {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  urlSlug?: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const email = input.email.trim();
  const nickname = input.nickname.trim().normalize("NFC").toLowerCase();
  const urlSlug = (input.urlSlug ?? "").trim().toLowerCase();

  if (!email) {
    errors.email = "이메일을 입력해 주세요";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "이메일 형식이 올바르지 않습니다";
  }

  if (!nickname) {
    errors.nickname = "닉네임을 입력해 주세요";
  } else if (!NICKNAME_REGEX.test(nickname)) {
    errors.nickname =
      "2–20자, 한글/영문으로 시작, 한글·영문·숫자·_ 만 가능";
  }

  if (urlSlug && !URL_SLUG_REGEX.test(urlSlug)) {
    errors.urlSlug = "2–20자, 영문 소문자로 시작, 영문/숫자만 가능";
  }

  const passwordError = getPasswordValidationError(input.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (!input.passwordConfirm) {
    errors.passwordConfirm = "비밀번호 확인을 입력해 주세요";
  } else if (input.password !== input.passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다";
  }

  return errors;
}

export function validateLoginInput(input: {
  email: string;
  password: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const email = input.email.trim();

  if (!email) {
    errors.email = "이메일을 입력해 주세요";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "이메일 형식이 올바르지 않습니다";
  }

  if (!input.password) {
    errors.password = "비밀번호를 입력해 주세요";
  }

  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Boolean(
    errors.email ||
      errors.password ||
      errors.passwordConfirm ||
      errors.nickname ||
      errors.urlSlug,
  );
}
