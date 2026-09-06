-- 008_invite_expires_at
-- 초대코드 24시간 만료

ALTER TABLE blog_invite_codes
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE blog_invite_codes
SET expires_at = created_at + INTERVAL '24 hours'
WHERE expires_at IS NULL;

ALTER TABLE blog_invite_codes
  ALTER COLUMN expires_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blog_invite_expires_at
  ON blog_invite_codes (expires_at)
  WHERE used_at IS NULL;
