-- 009_allow_multiple_unused_invites
-- 팀당 미사용 초대코드 1개 제한 제거 (1회용이지만 여러 명 초대 시 여러 개 발급 가능)

DROP INDEX IF EXISTS blog_invite_one_unused_per_blog;
