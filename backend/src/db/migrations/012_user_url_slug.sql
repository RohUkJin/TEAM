-- 012_user_url_slug
-- 표시용 nickname과 URL용 url_slug 분리

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS url_slug VARCHAR(32);

-- 영문 닉네임은 URL slug로 재사용
UPDATE users
SET url_slug = LOWER(nickname)
WHERE url_slug IS NULL
  AND nickname ~ '^[a-zA-Z][a-zA-Z0-9_]{1,19}$';

-- 한글 등이면 user{id}
UPDATE users
SET url_slug = 'user' || id::text
WHERE url_slug IS NULL OR url_slug = '';

-- slug 중복 해소
WITH ranked AS (
  SELECT id,
         url_slug,
         ROW_NUMBER() OVER (PARTITION BY LOWER(url_slug) ORDER BY id) AS rn
  FROM users
)
UPDATE users u
SET url_slug = ranked.url_slug || ranked.id::text
FROM ranked
WHERE u.id = ranked.id AND ranked.rn > 1;

ALTER TABLE users
  ALTER COLUMN url_slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_url_slug_lower_unique
  ON users (LOWER(url_slug));
