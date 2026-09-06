import { pool } from "../config/database";
import { PostRow } from "../types/post";

const POST_COLUMNS =
  "id, user_id, blog_id, title, content, view_count, trending_visible, created_at, updated_at";

export class PostRepository {
  async create(input: {
    userId: string;
    blogId: string;
    title: string;
    content: string;
    trendingVisible: boolean;
  }): Promise<PostRow> {
    const result = await pool.query<PostRow>(
      `INSERT INTO posts (user_id, blog_id, title, content, trending_visible)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${POST_COLUMNS}`,
      [
        input.userId,
        input.blogId,
        input.title,
        input.content,
        input.trendingVisible,
      ],
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<PostRow | null> {
    const result = await pool.query<PostRow>(
      `SELECT ${POST_COLUMNS}
       FROM posts
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findManyByBlogId(options: {
    blogId: string;
    limit: number;
    offset: number;
  }): Promise<PostRow[]> {
    const result = await pool.query<PostRow>(
      `SELECT ${POST_COLUMNS}
       FROM posts
       WHERE blog_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT $2 OFFSET $3`,
      [options.blogId, options.limit, options.offset],
    );
    return result.rows;
  }

  async countByBlogId(blogId: string): Promise<number> {
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM posts WHERE blog_id = $1`,
      [blogId],
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  async findManyPublicPersonal(options: {
    limit: number;
    offset: number;
  }): Promise<PostRow[]> {
    const result = await pool.query<PostRow>(
      `SELECT p.id, p.user_id, p.blog_id, p.title, p.content, p.view_count,
              p.trending_visible, p.created_at, p.updated_at
       FROM posts p
       INNER JOIN blogs b ON b.id = p.blog_id
       WHERE b.type = 'personal'
         AND p.trending_visible = true
       ORDER BY p.created_at DESC, p.id DESC
       LIMIT $1 OFFSET $2`,
      [options.limit, options.offset],
    );
    return result.rows;
  }

  async countPublicPersonal(): Promise<number> {
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM posts p
       INNER JOIN blogs b ON b.id = p.blog_id
       WHERE b.type = 'personal'
         AND p.trending_visible = true`,
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  /** 개인 블로그 글 — 당월 작성분, 조회순 / 댓글순 (트렌딩 노출만) */
  async findPopularPersonal(options: {
    limit: number;
    offset?: number;
    sort: "views" | "comments";
    /** inclusive start (UTC instant); posts with created_at >= this */
    periodStart: Date;
    /** exclusive end */
    periodEnd: Date;
  }): Promise<Array<PostRow & { comment_count: string }>> {
    const orderBy =
      options.sort === "comments"
        ? "COUNT(c.id) DESC, p.view_count DESC, p.created_at DESC, p.id DESC"
        : "p.view_count DESC, COUNT(c.id) DESC, p.created_at DESC, p.id DESC";
    const offset = options.offset ?? 0;

    const result = await pool.query<PostRow & { comment_count: string }>(
      `SELECT p.id, p.user_id, p.blog_id, p.title, p.content, p.view_count,
              p.trending_visible, p.created_at, p.updated_at,
              COUNT(c.id)::text AS comment_count
       FROM posts p
       INNER JOIN blogs b ON b.id = p.blog_id
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE b.type = 'personal'
         AND p.trending_visible = true
         AND p.created_at >= $2
         AND p.created_at < $3
       GROUP BY p.id
       ORDER BY ${orderBy}
       LIMIT $1 OFFSET $4`,
      [options.limit, options.periodStart, options.periodEnd, offset],
    );
    return result.rows;
  }

  async countPopularPersonal(options: {
    periodStart: Date;
    periodEnd: Date;
  }): Promise<number> {
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM posts p
       INNER JOIN blogs b ON b.id = p.blog_id
       WHERE b.type = 'personal'
         AND p.trending_visible = true
         AND p.created_at >= $1
         AND p.created_at < $2`,
      [options.periodStart, options.periodEnd],
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  /**
   * 같은 IP의 첫 조회만 view_count +1.
   * @returns true면 이번에 카운트됨
   */
  async recordViewIfNew(postId: string, viewerIp: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query<{ post_id: string }>(
        `INSERT INTO post_views (post_id, viewer_ip)
         VALUES ($1, $2)
         ON CONFLICT (post_id, viewer_ip) DO NOTHING
         RETURNING post_id`,
        [postId, viewerIp],
      );
      if (inserted.rowCount === 0) {
        await client.query("COMMIT");
        return false;
      }
      await client.query(
        `UPDATE posts SET view_count = view_count + 1 WHERE id = $1`,
        [postId],
      );
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    input: { title: string; content: string; trendingVisible: boolean },
  ): Promise<PostRow | null> {
    const result = await pool.query<PostRow>(
      `UPDATE posts
       SET title = $2, content = $3, trending_visible = $4, updated_at = NOW()
       WHERE id = $1
       RETURNING ${POST_COLUMNS}`,
      [id, input.title, input.content, input.trendingVisible],
    );
    return result.rows[0] ?? null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await pool.query(`DELETE FROM posts WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const postRepository = new PostRepository();
