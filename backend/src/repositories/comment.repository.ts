import { pool } from "../config/database";
import { CommentRow } from "../types/comment";

export class CommentRepository {
  async create(input: {
    postId: string;
    userId: string;
    content: string;
  }): Promise<CommentRow> {
    const result = await pool.query<CommentRow>(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, post_id, user_id, content, created_at, updated_at`,
      [input.postId, input.userId, input.content],
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<CommentRow | null> {
    const result = await pool.query<CommentRow>(
      `SELECT id, post_id, user_id, content, created_at, updated_at
       FROM comments
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByPostId(postId: string): Promise<CommentRow[]> {
    const result = await pool.query<CommentRow>(
      `SELECT id, post_id, user_id, content, created_at, updated_at
       FROM comments
       WHERE post_id = $1
       ORDER BY created_at ASC, id ASC`,
      [postId],
    );
    return result.rows;
  }

  async update(
    id: string,
    input: { content: string },
  ): Promise<CommentRow | null> {
    const result = await pool.query<CommentRow>(
      `UPDATE comments
       SET content = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, post_id, user_id, content, created_at, updated_at`,
      [id, input.content],
    );
    return result.rows[0] ?? null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await pool.query(`DELETE FROM comments WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const commentRepository = new CommentRepository();
