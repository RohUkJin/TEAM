-- 006_nicknames_and_blog_slugs
-- 닉네임 + 블로그 slug (공유 URL용)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS nickname VARCHAR(32);

-- 기존 유저 닉네임 백필 (이메일 local + id 로 충돌 방지)
UPDATE users
SET nickname = LOWER(
  REGEXP_REPLACE(
    SPLIT_PART(email, '@', 1),
    '[^a-zA-Z0-9_]',
    '',
    'g'
  )
)
WHERE nickname IS NULL OR nickname = '';

UPDATE users
SET nickname = 'user' || id::text
WHERE nickname IS NULL OR nickname = '' OR LENGTH(nickname) < 2;

-- 닉네임 중복 해소
WITH ranked AS (
  SELECT id,
         nickname,
         ROW_NUMBER() OVER (PARTITION BY LOWER(nickname) ORDER BY id) AS rn
  FROM users
)
UPDATE users u
SET nickname = ranked.nickname || ranked.id::text
FROM ranked
WHERE u.id = ranked.id AND ranked.rn > 1;

ALTER TABLE users
  ALTER COLUMN nickname SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_nickname_lower_unique
  ON users (LOWER(nickname));

ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS slug VARCHAR(64);

-- 개인 블로그 slug 기본값 blog
UPDATE blogs
SET slug = 'blog'
WHERE type = 'personal' AND (slug IS NULL OR slug = '');

-- 팀 블로그 slug: 이름 기반 + id
UPDATE blogs
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9가-힣]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  )
)
WHERE type = 'team' AND (slug IS NULL OR slug = '');

UPDATE blogs
SET slug = 'team-' || id::text
WHERE type = 'team' AND (slug IS NULL OR slug = '' OR LENGTH(slug) < 2);

-- 팀 slug 영문만 남기기 어려우면 id 접미
UPDATE blogs
SET slug = 'team-' || id::text
WHERE type = 'team' AND slug !~ '^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$';

WITH team_ranked AS (
  SELECT id,
         slug,
         ROW_NUMBER() OVER (PARTITION BY LOWER(slug) ORDER BY id) AS rn
  FROM blogs
  WHERE type = 'team'
)
UPDATE blogs b
SET slug = team_ranked.slug || '-' || team_ranked.id::text
FROM team_ranked
WHERE b.id = team_ranked.id AND team_ranked.rn > 1;

ALTER TABLE blogs
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS blogs_team_slug_lower_unique
  ON blogs (LOWER(slug))
  WHERE type = 'team';
