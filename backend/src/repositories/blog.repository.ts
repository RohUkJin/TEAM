import { pool } from "../config/database";
import {
  BlogInviteCodeRow,
  BlogMemberRole,
  BlogMemberRow,
  BlogRow,
  BlogType,
} from "../types/blog";

const BLOG_COLUMNS =
  "id, owner_id, type, name, slug, description, created_at, updated_at";

export class BlogRepository {
  async create(input: {
    ownerId: string;
    type: BlogType;
    name: string;
    slug: string;
    description?: string;
  }): Promise<BlogRow> {
    const result = await pool.query<BlogRow>(
      `INSERT INTO blogs (owner_id, type, name, slug, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${BLOG_COLUMNS}`,
      [
        input.ownerId,
        input.type,
        input.name,
        input.slug,
        input.description ?? "",
      ],
    );
    return result.rows[0];
  }

  async updateDescription(
    blogId: string,
    description: string,
  ): Promise<BlogRow | null> {
    const result = await pool.query<BlogRow>(
      `UPDATE blogs
       SET description = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING ${BLOG_COLUMNS}`,
      [blogId, description],
    );
    return result.rows[0] ?? null;
  }

  async updateTeam(
    blogId: string,
    input: { name?: string; description?: string },
  ): Promise<BlogRow | null> {
    const sets: string[] = ["updated_at = NOW()"];
    const params: unknown[] = [blogId];

    if (input.name !== undefined) {
      params.push(input.name);
      sets.push(`name = $${params.length}`);
    }
    if (input.description !== undefined) {
      params.push(input.description);
      sets.push(`description = $${params.length}`);
    }

    const result = await pool.query<BlogRow>(
      `UPDATE blogs
       SET ${sets.join(", ")}
       WHERE id = $1
       RETURNING ${BLOG_COLUMNS}`,
      params,
    );
    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<BlogRow | null> {
    const result = await pool.query<BlogRow>(
      `SELECT ${BLOG_COLUMNS}
       FROM blogs
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findPersonalByOwnerId(ownerId: string): Promise<BlogRow | null> {
    const result = await pool.query<BlogRow>(
      `SELECT ${BLOG_COLUMNS}
       FROM blogs
       WHERE owner_id = $1 AND type = 'personal'
       LIMIT 1`,
      [ownerId],
    );
    return result.rows[0] ?? null;
  }

  async findPersonalByUrlSlugAndSlug(
    urlSlug: string,
    slug: string,
  ): Promise<BlogRow | null> {
    const result = await pool.query<BlogRow>(
      `SELECT b.id, b.owner_id, b.type, b.name, b.slug, b.description,
              b.created_at, b.updated_at
       FROM blogs b
       INNER JOIN users u ON u.id = b.owner_id
       WHERE b.type = 'personal'
         AND LOWER(u.url_slug) = LOWER($1)
         AND LOWER(b.slug) = LOWER($2)
       LIMIT 1`,
      [urlSlug, slug],
    );
    return result.rows[0] ?? null;
  }

  async findTeamBySlug(slug: string): Promise<BlogRow | null> {
    const result = await pool.query<BlogRow>(
      `SELECT ${BLOG_COLUMNS}
       FROM blogs
       WHERE type = 'team' AND LOWER(slug) = LOWER($1)
       LIMIT 1`,
      [slug],
    );
    return result.rows[0] ?? null;
  }

  async findLatestTeamByOwner(ownerId: string): Promise<BlogRow | null> {
    const result = await pool.query<BlogRow>(
      `SELECT ${BLOG_COLUMNS}
       FROM blogs
       WHERE owner_id = $1 AND type = 'team'
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [ownerId],
    );
    return result.rows[0] ?? null;
  }

  async isTeamSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const result = await pool.query<{ exists: boolean }>(
      excludeId
        ? `SELECT EXISTS(
             SELECT 1 FROM blogs
             WHERE type = 'team' AND LOWER(slug) = LOWER($1) AND id <> $2
           ) AS exists`
        : `SELECT EXISTS(
             SELECT 1 FROM blogs
             WHERE type = 'team' AND LOWER(slug) = LOWER($1)
           ) AS exists`,
      excludeId ? [slug, excludeId] : [slug],
    );
    return Boolean(result.rows[0]?.exists);
  }

  async isTeamNameTaken(name: string, excludeId?: string): Promise<boolean> {
    const result = await pool.query<{ exists: boolean }>(
      excludeId
        ? `SELECT EXISTS(
             SELECT 1 FROM blogs
             WHERE type = 'team' AND LOWER(name) = LOWER($1) AND id <> $2
           ) AS exists`
        : `SELECT EXISTS(
             SELECT 1 FROM blogs
             WHERE type = 'team' AND LOWER(name) = LOWER($1)
           ) AS exists`,
      excludeId ? [name, excludeId] : [name],
    );
    return Boolean(result.rows[0]?.exists);
  }

  async findMany(options: {
    limit: number;
    offset: number;
    type?: BlogType;
    prioritizeOwnerId?: string;
    prioritizeMemberUserId?: string;
    sort?:
      | "members_desc"
      | "members_asc"
      | "created_desc"
      | "created_asc";
  }): Promise<BlogRow[]> {
    const params: unknown[] = [];
    const where: string[] = [];

    if (options.type) {
      params.push(options.type);
      where.push(`b.type = $${params.length}`);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const sort = options.sort ?? "created_desc";

    let memberPrioritySql = "";
    if (options.prioritizeMemberUserId) {
      params.push(options.prioritizeMemberUserId);
      memberPrioritySql = `CASE WHEN EXISTS (
        SELECT 1 FROM blog_members vm
        WHERE vm.blog_id = b.id AND vm.user_id = $${params.length}
      ) THEN 0 ELSE 1 END ASC, `;
    }

    let orderSql = `ORDER BY ${memberPrioritySql}b.created_at DESC, b.id DESC`;
    if (options.prioritizeOwnerId && options.type === "personal") {
      params.push(options.prioritizeOwnerId);
      orderSql = `ORDER BY CASE WHEN b.owner_id = $${params.length} THEN 0 ELSE 1 END,
                         b.created_at DESC, b.id DESC`;
    } else if (sort === "members_desc") {
      orderSql = `ORDER BY ${memberPrioritySql}COUNT(m.user_id) DESC, b.created_at DESC, b.id DESC`;
    } else if (sort === "members_asc") {
      orderSql = `ORDER BY ${memberPrioritySql}COUNT(m.user_id) ASC, b.created_at DESC, b.id DESC`;
    } else if (sort === "created_asc") {
      orderSql = `ORDER BY ${memberPrioritySql}b.created_at ASC, b.id ASC`;
    } else {
      orderSql = `ORDER BY ${memberPrioritySql}b.created_at DESC, b.id DESC`;
    }

    params.push(options.limit, options.offset);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const needsMemberJoin =
      sort === "members_desc" || sort === "members_asc";

    const result = await pool.query<BlogRow>(
      needsMemberJoin
        ? `SELECT b.id, b.owner_id, b.type, b.name, b.slug, b.description,
                  b.created_at, b.updated_at
           FROM blogs b
           LEFT JOIN blog_members m ON m.blog_id = b.id
           ${whereSql}
           GROUP BY b.id
           ${orderSql}
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`
        : `SELECT b.id, b.owner_id, b.type, b.name, b.slug, b.description,
                  b.created_at, b.updated_at
           FROM blogs b
           ${whereSql}
           ${orderSql}
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );
    return result.rows;
  }

  async countAll(type?: BlogType): Promise<number> {
    if (type) {
      const result = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM blogs WHERE type = $1`,
        [type],
      );
      return Number(result.rows[0]?.count ?? 0);
    }
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM blogs`,
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  async countTeamCreatedByOwnerSince(
    ownerId: string,
    since: Date,
  ): Promise<number> {
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM blogs
       WHERE owner_id = $1
         AND type = 'team'
         AND created_at >= $2`,
      [ownerId, since],
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  async addMember(input: {
    blogId: string;
    userId: string;
    role: BlogMemberRole;
  }): Promise<BlogMemberRow> {
    const result = await pool.query<BlogMemberRow>(
      `INSERT INTO blog_members (blog_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (blog_id, user_id) DO UPDATE
         SET role = EXCLUDED.role
       RETURNING blog_id, user_id, role, joined_at`,
      [input.blogId, input.userId, input.role],
    );
    return result.rows[0];
  }

  async findMember(
    blogId: string,
    userId: string,
  ): Promise<BlogMemberRow | null> {
    const result = await pool.query<BlogMemberRow>(
      `SELECT blog_id, user_id, role, joined_at
       FROM blog_members
       WHERE blog_id = $1 AND user_id = $2`,
      [blogId, userId],
    );
    return result.rows[0] ?? null;
  }

  async findMembersByBlogIds(
    blogIds: string[],
    userId: string,
  ): Promise<Map<string, BlogMemberRow>> {
    const map = new Map<string, BlogMemberRow>();
    if (blogIds.length === 0) return map;

    const result = await pool.query<BlogMemberRow>(
      `SELECT blog_id, user_id, role, joined_at
       FROM blog_members
       WHERE user_id = $1 AND blog_id = ANY($2::bigint[])`,
      [userId, blogIds],
    );
    for (const row of result.rows) {
      map.set(row.blog_id, row);
    }
    return map;
  }

  async countMembersByBlogIds(blogIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (blogIds.length === 0) return map;
    const result = await pool.query<{ blog_id: string; count: string }>(
      `SELECT blog_id, COUNT(*)::text AS count
       FROM blog_members
       WHERE blog_id = ANY($1::bigint[])
       GROUP BY blog_id`,
      [blogIds],
    );
    for (const row of result.rows) {
      map.set(row.blog_id, Number(row.count));
    }
    return map;
  }

  async countMembers(blogId: string): Promise<number> {
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM blog_members WHERE blog_id = $1`,
      [blogId],
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  /** 멤버 수 기준 인기 팀 블로그 */
  async findPopularTeams(limit: number): Promise<
    Array<BlogRow & { member_count: string }>
  > {
    const result = await pool.query<BlogRow & { member_count: string }>(
      `SELECT b.id, b.owner_id, b.type, b.name, b.slug, b.description,
              b.created_at, b.updated_at,
              COUNT(m.user_id)::text AS member_count
       FROM blogs b
       LEFT JOIN blog_members m ON m.blog_id = b.id
       WHERE b.type = 'team'
       GROUP BY b.id
       ORDER BY COUNT(m.user_id) DESC, b.created_at DESC, b.id DESC
       LIMIT $1`,
      [limit],
    );
    return result.rows;
  }

  async deleteExpiredInvites(blogId?: string): Promise<number> {
    const result = blogId
      ? await pool.query(
          `DELETE FROM blog_invite_codes
           WHERE blog_id = $1
             AND used_at IS NULL
             AND expires_at <= NOW()`,
          [blogId],
        )
      : await pool.query(
          `DELETE FROM blog_invite_codes
           WHERE used_at IS NULL
             AND expires_at <= NOW()`,
        );
    return result.rowCount ?? 0;
  }

  async deleteInviteById(inviteId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM blog_invite_codes WHERE id = $1`,
      [inviteId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async createInvite(input: {
    blogId: string;
    tokenHash: string;
    createdBy: string;
    expiresAt: Date;
  }): Promise<BlogInviteCodeRow> {
    const result = await pool.query<BlogInviteCodeRow>(
      `INSERT INTO blog_invite_codes (blog_id, token_hash, created_by, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, blog_id, token_hash, created_by, created_at, expires_at,
                 used_at, used_by_user_id`,
      [input.blogId, input.tokenHash, input.createdBy, input.expiresAt],
    );
    return result.rows[0];
  }

  async findInviteByTokenHash(
    tokenHash: string,
  ): Promise<BlogInviteCodeRow | null> {
    const result = await pool.query<BlogInviteCodeRow>(
      `SELECT id, blog_id, token_hash, created_by, created_at, expires_at,
              used_at, used_by_user_id
       FROM blog_invite_codes
       WHERE token_hash = $1`,
      [tokenHash],
    );
    return result.rows[0] ?? null;
  }

  async markInviteUsed(input: {
    inviteId: string;
    usedByUserId: string;
  }): Promise<BlogInviteCodeRow | null> {
    const result = await pool.query<BlogInviteCodeRow>(
      `UPDATE blog_invite_codes
       SET used_at = NOW(), used_by_user_id = $2
       WHERE id = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       RETURNING id, blog_id, token_hash, created_by, created_at, expires_at,
                 used_at, used_by_user_id`,
      [input.inviteId, input.usedByUserId],
    );
    return result.rows[0] ?? null;
  }
}

export const blogRepository = new BlogRepository();
