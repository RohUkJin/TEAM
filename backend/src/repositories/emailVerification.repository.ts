import { pool } from "../config/database";
import { EmailVerificationTokenRow } from "../types/emailVerification";

export class EmailVerificationRepository {
  async invalidateUnusedTokensForUser(userId: string): Promise<void> {
    await pool.query(
      `UPDATE email_verification_tokens
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId],
    );
  }

  async createToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<EmailVerificationTokenRow> {
    const result = await pool.query<EmailVerificationTokenRow>(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, token_hash, expires_at, used_at, created_at`,
      [input.userId, input.tokenHash, input.expiresAt],
    );
    return result.rows[0];
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationTokenRow | null> {
    const result = await pool.query<EmailVerificationTokenRow>(
      `SELECT id, user_id, token_hash, expires_at, used_at, created_at
       FROM email_verification_tokens
       WHERE token_hash = $1`,
      [tokenHash],
    );
    return result.rows[0] ?? null;
  }

  async markUsed(id: string): Promise<void> {
    await pool.query(
      `UPDATE email_verification_tokens
       SET used_at = NOW()
       WHERE id = $1 AND used_at IS NULL`,
      [id],
    );
  }
}

export const emailVerificationRepository = new EmailVerificationRepository();
