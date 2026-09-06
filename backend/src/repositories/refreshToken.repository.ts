import { pool } from "../config/database";

export type RefreshTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
};

export class RefreshTokenRepository {
  async create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshTokenRow> {
    const result = await pool.query<RefreshTokenRow>(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, token_hash, expires_at, revoked_at, created_at`,
      [input.userId, input.tokenHash, input.expiresAt],
    );
    return result.rows[0];
  }

  async findByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    const result = await pool.query<RefreshTokenRow>(
      `SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
       FROM refresh_tokens
       WHERE token_hash = $1`,
      [tokenHash],
    );
    return result.rows[0] ?? null;
  }

  async revokeByHash(tokenHash: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE token_hash = $1
         AND revoked_at IS NULL`,
      [tokenHash],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const result = await pool.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE user_id = $1
         AND revoked_at IS NULL`,
      [userId],
    );
    return result.rowCount ?? 0;
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
