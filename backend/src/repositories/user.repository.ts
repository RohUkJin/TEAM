import { pool } from "../config/database";
import { UserRow } from "../types/user";

const USER_COLUMNS =
  "id, email, password_hash, nickname, url_slug, email_verified, created_at, updated_at";

export type UserOwnerMeta = {
  nickname: string;
  urlSlug: string;
};

export class UserRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      `SELECT ${USER_COLUMNS}
       FROM users
       WHERE email = $1`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async findByNickname(nickname: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      `SELECT ${USER_COLUMNS}
       FROM users
       WHERE LOWER(nickname) = LOWER($1)`,
      [nickname],
    );
    return result.rows[0] ?? null;
  }

  async findByUrlSlug(urlSlug: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      `SELECT ${USER_COLUMNS}
       FROM users
       WHERE LOWER(url_slug) = LOWER($1)`,
      [urlSlug],
    );
    return result.rows[0] ?? null;
  }

  async createUser(input: {
    email: string;
    passwordHash: string;
    nickname: string;
    urlSlug: string;
    emailVerified?: boolean;
  }): Promise<UserRow> {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (email, password_hash, nickname, url_slug, email_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${USER_COLUMNS}`,
      [
        input.email,
        input.passwordHash,
        input.nickname,
        input.urlSlug,
        input.emailVerified ?? false,
      ],
    );
    return result.rows[0];
  }

  async updateUrlSlug(userId: string, urlSlug: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      `UPDATE users
       SET url_slug = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING ${USER_COLUMNS}`,
      [userId, urlSlug],
    );
    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      `SELECT ${USER_COLUMNS}
       FROM users
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findNicknamesByIds(
    userIds: string[],
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (userIds.length === 0) return map;
    const result = await pool.query<{ id: string; nickname: string }>(
      `SELECT id, nickname FROM users WHERE id = ANY($1::bigint[])`,
      [userIds],
    );
    for (const row of result.rows) {
      map.set(row.id, row.nickname);
    }
    return map;
  }

  async findOwnerMetaByIds(
    userIds: string[],
  ): Promise<Map<string, UserOwnerMeta>> {
    const map = new Map<string, UserOwnerMeta>();
    if (userIds.length === 0) return map;
    const result = await pool.query<{
      id: string;
      nickname: string;
      url_slug: string;
    }>(
      `SELECT id, nickname, url_slug FROM users WHERE id = ANY($1::bigint[])`,
      [userIds],
    );
    for (const row of result.rows) {
      map.set(row.id, {
        nickname: row.nickname,
        urlSlug: row.url_slug,
      });
    }
    return map;
  }

  async markEmailVerified(userId: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      `UPDATE users
       SET email_verified = TRUE, updated_at = NOW()
       WHERE id = $1
       RETURNING ${USER_COLUMNS}`,
      [userId],
    );
    return result.rows[0] ?? null;
  }
}

export const userRepository = new UserRepository();
