import { Resend } from "resend";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export type VerificationEmailPayload = {
  to: string;
  verificationToken: string;
  verifyPath: string;
};

export interface EmailSender {
  sendVerificationEmail(payload: VerificationEmailPayload): Promise<void>;
}

function buildVerificationLink(payload: VerificationEmailPayload): string {
  return `${payload.verifyPath}?token=${encodeURIComponent(payload.verificationToken)}`;
}

/**
 * 개발용: 실제 메일 없이 콘솔에 인증 링크/토큰을 출력한다.
 */
export class ConsoleEmailSender implements EmailSender {
  async sendVerificationEmail(payload: VerificationEmailPayload): Promise<void> {
    const link = buildVerificationLink(payload);
    console.info("[dev-email] verification mail (not actually sent)");
    console.info(`[dev-email] to=${payload.to}`);
    console.info(`[dev-email] token=${payload.verificationToken}`);
    console.info(`[dev-email] link=${link}`);
  }
}

/**
 * Resend API로 인증 메일을 발송한다.
 */
export class ResendEmailSender implements EmailSender {
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async sendVerificationEmail(payload: VerificationEmailPayload): Promise<void> {
    const link = buildVerificationLink(payload);
    const { error } = await this.client.emails.send({
      from: env.emailFrom,
      to: payload.to,
      subject: "[TEAM] 이메일 인증을 완료해 주세요",
      text: [
        "TEAM 회원가입을 환영합니다.",
        "",
        "아래 링크를 열어 이메일 인증을 완료해 주세요.",
        link,
        "",
        `이 링크는 약 ${env.emailVerificationExpiresHours}시간 동안 유효합니다.`,
        "본인이 가입하지 않았다면 이 메일을 무시해 주세요.",
      ].join("\n"),
      html: `
        <div style="font-family:sans-serif;line-height:1.6;color:#111">
          <p>TEAM 회원가입을 환영합니다.</p>
          <p>아래 버튼을 눌러 이메일 인증을 완료해 주세요.</p>
          <p>
            <a href="${link}"
               style="display:inline-block;padding:12px 18px;background:#12b886;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
              이메일 인증하기
            </a>
          </p>
          <p style="font-size:13px;color:#555">
            버튼이 동작하지 않으면 이 링크를 브라우저에 붙여넣으세요.<br/>
            <a href="${link}">${link}</a>
          </p>
          <p style="font-size:13px;color:#555">
            이 링크는 약 ${env.emailVerificationExpiresHours}시간 동안 유효합니다.
            본인이 가입하지 않았다면 이 메일을 무시해 주세요.
          </p>
        </div>
      `.trim(),
    });

    if (error) {
      console.error("[email] Resend send failed:", error);
      throw AppError.internal("Failed to send verification email");
    }
  }
}

export function createEmailSender(): EmailSender {
  if (env.emailTransport === "resend") {
    return new ResendEmailSender(env.resendApiKey);
  }
  return new ConsoleEmailSender();
}

export const emailSender: EmailSender = createEmailSender();
