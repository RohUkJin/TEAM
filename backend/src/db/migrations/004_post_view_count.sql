-- 004_post_view_count
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS view_count BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts (view_count DESC);
