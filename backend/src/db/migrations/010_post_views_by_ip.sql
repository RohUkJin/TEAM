-- 010_post_views_by_ip
-- 같은 IP의 동일 글 중복 조회수 증가 방지

CREATE TABLE IF NOT EXISTS post_views (
  post_id BIGINT NOT NULL,
  viewer_ip VARCHAR(64) NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT post_views_pkey PRIMARY KEY (post_id, viewer_ip),
  CONSTRAINT post_views_post_id_fkey
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at
  ON post_views (viewed_at DESC);
