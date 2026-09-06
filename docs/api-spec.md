# API Spec

## 문서 목적

**어떤 API를 만들었는가**를 기록한다.

공통 계약·인증·에러·엔드포인트 **목록**을 유지한다.  
요청/응답 필드·예제·Try it out의 **정본은 OpenAPI / Swagger UI**다.

* 스펙 소스: `backend/src/docs/openapi.ts`
* UI: `GET /api/docs` (예: http://localhost:4000/api/docs)
* 커버리지 검증: `backend/src/scripts/verifySwaggerCoverage.ts`

과정상의 결정은 `ai-development-log.md`를 본다.

---

## 현재 상태

> REST API는 `/api` 하위에 구현·문서화되어 있다.  
> 상세 스키마는 markdown에 복제하지 않고 Swagger에 위임한다.  
> 라우트 추가·변경 시 OpenAPI와 이 목록을 함께 갱신한다.

---

## 공통 규칙

### Base URL

* `/api` (서버: `http://localhost:4000/api`, Docker 동일 포트 기본)

### 인증 방식

* **선택:** HttpOnly Cookie `access_token` (JWT)
* **재발급:** Cookie `refresh_token` → `POST /api/auth/refresh` (로테이션)
* **로그아웃:** `POST /api/auth/logout` (refresh 폐기 + 쿠키 삭제)
* 보호 API: `cookieAuth` (Swagger) / `requireAuth` 미들웨어
* 선택 인증: `optionalAuth` (예: 블로그 목록의 `isMember`)
* 상세: `security.md`

### 공통 헤더 / 클라이언트

* Frontend: `credentials: "include"`
* CORS: `FRONTEND_ORIGIN`만 허용, `credentials: true`
* Content-Type: `application/json` (body 있는 요청)

### 공통 에러 형식

```json
{
  "error": {
    "code": "EXAMPLE_CODE",
    "message": "human readable message",
    "details": {}
  }
}
```

| 상태 | 의미 (대표) |
|------|-------------|
| 400 | 유효성 검사 실패 |
| 401 | 미인증 / 토큰 무효·만료 / refresh 재사용 등 |
| 403 | 인증됐으나 권한 없음 (이메일 미인증 로그인, 소유권, 팀 잠금 등) |
| 404 | 리소스 없음 |
| 409 | 충돌 (이메일·닉네임·urlSlug·팀 이름 등) |
| 503 | Health에서 DB 장애 |

성공 응답은 대체로 `{ "data": ... }` 래퍼를 사용한다 (엔드포인트별 Swagger 확인).

---

## 엔드포인트 목록

상세 Request/Response는 Swagger 참고. 아래는 목록·인증 요약만.

### Health

| Method | Path | 인증 | 요약 |
|--------|------|------|------|
| GET | `/health` | 없음 | DB 포함 헬스 |

### Auth

| Method | Path | 인증 | 요약 |
|--------|------|------|------|
| POST | `/auth/register` | 없음 | 가입 (`emailVerified=false`). console transport 시 `devVerificationToken` 가능 |
| POST | `/auth/verify-email` | 없음 | 이메일 토큰 검증 |
| POST | `/auth/login` | 없음 | access + refresh 쿠키 발급 |
| POST | `/auth/refresh` | refresh 쿠키 | 로테이션; 폐기 토큰 재사용 시 세션 전부 폐기 |
| POST | `/auth/logout` | 없음(쿠키) | refresh 폐기 · 쿠키 삭제 |
| GET | `/auth/me` | access | 현재 사용자 |

### Feed

| Method | Path | 인증 | 요약 |
|--------|------|------|------|
| GET | `/feed/home` | 없음 | 당월 인기 개인 글 + 인기 팀 |

### Blogs

| Method | Path | 인증 | 요약 |
|--------|------|------|------|
| GET | `/blogs` | optional | 목록 (`type`, `sort`, 페이지) |
| POST | `/blogs` | 필요 | 생성 (팀: 주 1회 제한) |
| GET | `/blogs/me` | 필요 | 내 개인 블로그 |
| GET | `/blogs/team-create-status` | 필요 | 팀 생성 가능 여부 |
| GET | `/blogs/check-name` | 필요 | 팀 이름 중복 |
| GET | `/blogs/resolve` | optional | vanity path → 블로그 |
| GET | `/blogs/{blogId}` | 팀: 멤버 | 블로그 조회 |
| PATCH | `/blogs/{blogId}` | 소유자 | 팀 이름/소개 |
| GET | `/blogs/{blogId}/meta` | 없음 | 공개 메타 (잠금 없음) |
| POST | `/blogs/{blogId}/join` | 필요 | 초대코드 가입 |
| POST | `/blogs/{blogId}/invites` | 소유자 | 1회용 초대 발급 (24h) |
| GET | `/blogs/{blogId}/posts` | 팀: 멤버 | 글 목록 |
| POST | `/blogs/{blogId}/posts` | 멤버 | 글 작성 |

### Posts

| Method | Path | 인증 | 요약 |
|--------|------|------|------|
| GET | `/posts` | 없음 | 공개 개인 글 목록 |
| POST | `/posts` | 필요 | 내 개인 블로그에 글 작성 |
| GET | `/posts/{id}` | optional | 상세 (팀 비멤버는 잠금/제한 응답 가능) |
| PUT | `/posts/{id}` | 작성자 | 수정 |
| DELETE | `/posts/{id}` | 작성자 | 삭제 |

### Comments

| Method | Path | 인증 | 요약 |
|--------|------|------|------|
| GET | `/posts/{postId}/comments` | 없음* | 목록 (*팀 글 가독성과 동일 규칙 적용 가능) |
| POST | `/posts/{postId}/comments` | 필요 | 작성 |
| PUT | `/comments/{commentId}` | 작성자 | 수정 |
| DELETE | `/comments/{commentId}` | 작성자 | 삭제 |

---

## 설계 결정 이력

| 날짜 | 결정 | 이전 선택 | 변경 이유 |
|------|------|-----------|-----------|
| 2026-08-12 | API 설계를 `api-spec.md`로 분리 | 미분리 | 과정 로그와 계약 분리 |
| 2026-08 | OpenAPI + Swagger UI를 API 정본으로 | markdown만 | 구현 동기화·계약 확인 (STEP 16) |
| 2026-09 | `/auth/refresh`, blogs/feed 경로 추가 | auth+posts+comments | 세션·블로그 도메인 확장 |
| 2026-09 | api-spec은 목록만, 상세는 Swagger 위임 | 전량 markdown | 중복·불일치 방지 |

---

## 관련 문서

* `ai-development-log.md` — 질문 / 명령 / 결과 / 검증
* `architecture.md` — 현재 시스템 설계
* `security.md` — 보안 설계 및 검토
* `network-flow.md` — 네트워크 흐름
