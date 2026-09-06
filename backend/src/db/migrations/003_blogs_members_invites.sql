-- 003_blogs_members_invites
-- 개인/팀 블로그 공간, 멤버십, 일회용 초대코드, posts.blog_id

CREATE TABLE IF NOT EXISTS blogs (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT NOT NULL,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blogs_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT blogs_type_check CHECK (type IN ('personal', 'team'))
);

-- 유저당 개인 블로그는 1개
CREATE UNIQUE INDEX IF NOT EXISTS blogs_one_personal_per_owner
  ON blogs (owner_id)
  WHERE type = 'personal';

CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_owner_id ON blogs (owner_id);
CREATE INDEX IF NOT EXISTS idx_blogs_type ON blogs (type);

CREATE TABLE IF NOT EXISTS blog_members (
  blog_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role VARCHAR(20) NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blog_members_pkey PRIMARY KEY (blog_id, user_id),
  CONSTRAINT blog_members_blog_id_fkey
    FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE,
  CONSTRAINT blog_members_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT blog_members_role_check CHECK (role IN ('owner', 'member'))
);

CREATE INDEX IF NOT EXISTS idx_blog_members_user_id ON blog_members (user_id);

CREATE TABLE IF NOT EXISTS blog_invite_codes (
  id BIGSERIAL PRIMARY KEY,
  blog_id BIGINT NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  used_by_user_id BIGINT,
  CONSTRAINT blog_invite_codes_blog_id_fkey
    FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE,
  CONSTRAINT blog_invite_codes_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT blog_invite_codes_used_by_fkey
    FOREIGN KEY (used_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT blog_invite_codes_token_hash_unique UNIQUE (token_hash)
);

-- 팀당 미사용 초대코드 최대 1개
CREATE UNIQUE INDEX IF NOT EXISTS blog_invite_one_unused_per_blog
  ON blog_invite_codes (blog_id)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_blog_invite_blog_id ON blog_invite_codes (blog_id);

-- 기존 유저 개인 블로그 백필
INSERT INTO blogs (owner_id, type, name)
SELECT
  u.id,
  'personal',
  CASE
    WHEN position('@' IN u.email) > 1
      THEN left(u.email, position('@' IN u.email) - 1) || '의 블로그'
    ELSE '나의 블로그'
  END
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM blogs b WHERE b.owner_id = u.id AND b.type = 'personal'
);

INSERT INTO blog_members (blog_id, user_id, role)
SELECT b.id, b.owner_id, 'owner'
FROM blogs b
WHERE b.type = 'personal'
  AND NOT EXISTS (
    SELECT 1 FROM blog_members m
    WHERE m.blog_id = b.id AND m.user_id = b.owner_id
  );

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS blog_id BIGINT;

UPDATE posts p
SET blog_id = b.id
FROM blogs b
WHERE p.blog_id IS NULL
  AND b.owner_id = p.user_id
  AND b.type = 'personal';

-- 고아 게시글이 있으면 마이그레이션을 실패시킨다
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM posts WHERE blog_id IS NULL) THEN
    RAISE EXCEPTION 'posts.blog_id backfill incomplete: orphan posts remain';
  END IF;
END $$;

ALTER TABLE posts
  ALTER COLUMN blog_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_blog_id_fkey'
  ) THEN
    ALTER TABLE posts
      ADD CONSTRAINT posts_blog_id_fkey
      FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_blog_id ON posts (blog_id);
CREATE INDEX IF NOT EXISTS idx_posts_blog_created_at ON posts (blog_id, created_at DESC);
