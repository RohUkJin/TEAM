-- 005_post_trending_visible
-- 개인 블로그 글의 트렌딩(인기글) 노출 여부
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS trending_visible BOOLEAN NOT NULL DEFAULT false;

-- 기존 개인 블로그 글은 트렌딩에 유지
UPDATE posts p
SET trending_visible = true
FROM blogs b
WHERE p.blog_id = b.id
  AND b.type = 'personal'
  AND p.trending_visible = false;

CREATE INDEX IF NOT EXISTS idx_posts_trending_visible
  ON posts (trending_visible)
  WHERE trending_visible = true;
