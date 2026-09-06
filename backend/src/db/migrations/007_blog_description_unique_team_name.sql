-- 007_blog_description_unique_team_name
-- 팀/개인 블로그 소개글 + 팀 이름 중복 방지

ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS blogs_team_name_lower_unique
  ON blogs (LOWER(name))
  WHERE type = 'team';
