# Architecture

## 문서 목적

현재 시스템은 **어떻게 설계되어 있는가**를 기록한다.

이 문서는 구현 과정의 질문/명령 기록이 아니다.
시스템의 구조, 계층, 책임 분리, 주요 컴포넌트와 그 관계를 설명한다.
의사결정 과정은 `ai-development-log.md`를 본다.

---

## 현재 상태

> 애플리케이션·Docker Compose까지 동작하는 아키텍처가 확정되어 있다.  
> 클라우드 실배포는 미착수.  
> 구현과 불일치가 생기면 구현을 기준으로 이 문서를 갱신한다.

---

## 시스템 개요

* **목적:** 개인/팀 블로그 공간 + JWT 쿠키 인증 REST API + Next.js UI (학습용 풀스택)
* **주요 유스케이스:**
  * 회원가입 → 이메일 인증 → 로그인
  * 개인 블로그 자동 생성 / 팀 블로그 생성·초대 가입
  * 글·댓글 CRUD, 홈 트렌딩(개인 글), 페이징
* **의도적 비범위:** 좋아요·검색·업로드·OAuth 등

---

## 기술 스택

| 영역 | 선택 | 상태 | 대안 / 한 줄 이유 |
|------|------|------|-------------------|
| Frontend | Next.js 16 + TS, Zustand | 적용 | Nuxt 등 — 과제 스택·App Router 학습 |
| Backend | Express + TS | 적용 | FastAPI/Nest — Node 계층 설명·범위 관리 |
| Database | PostgreSQL 16, SQL migrations | 적용 | ORM — 스키마를 SQL로 직접 설명 |
| Auth | JWT + HttpOnly Cookie (+ refresh) | 적용 | Bearer+메모리 → Cookie로 전환 (보안 STEP) |
| Email | console / Resend | 적용 | transport 분리로 로컬·운영 구분 |
| API docs | OpenAPI + swagger-ui-express | 적용 | markdown 단독 복제 지양 |
| Infra | Docker Compose (frontend, backend, db) | 적용 | 로컬 npm과 병행 가능 |
| Deploy | 미착수 | 예정 | Oracle/AWS — Docker 이후 |

---

## 계층 구조

```text
Browser (Next.js)
  → HTTP + credentials (Cookie)
Backend Express (/api)
  → routes → controllers → services → repositories
  → PostgreSQL
  → (선택) Resend
```

| 계층 | 책임 | 하지 않는 일 |
|------|------|--------------|
| routes | 경로·미들웨어 연결 | 비즈니스 규칙 |
| controllers | req/res, status | SQL·도메인 분기 과다 |
| services | 인증·인가·도메인 규칙 | HTTP 상세 |
| repositories | SQL / DB 접근 | 권한 판정 |
| frontend services + api client | fetch·에러 매핑 | 서버 권한 최종 결정 |
| zustand auth store | 로그인 UI 상태 (`/auth/me`) | 토큰을 JS에 보관하지 않음 |

---

## 컴포넌트와 책임

### Frontend (`frontend/`)

* App Router 페이지 + 컴포넌트 (홈 피드, 블로그, 글, 인증 UI)
* `credentials: "include"`로 API 호출 → Cookie 자동 전송
* Protected route는 UX 가드; 권한 실패는 API 403으로 최종 확인

### Backend (`backend/`)

* `/api` 마운트, CORS(`FRONTEND_ORIGIN` + credentials)
* 인증: `requireAuth` / `optionalAuth`, refresh 로테이션
* 블로그: personal(공개 읽기) / team(멤버만 본문), 초대코드 가입
* Swagger UI: `GET /api/docs`

### Database

* 마이그레이션: `backend/src/db/migrations/` (users, posts, comments, blogs/members/invites, refresh_tokens, url_slug 등)
* 관계: 사용자–블로그–글–댓글 FK; 팀 멤버십·초대 해시 저장

### Docker (`docker/docker-compose.yml`)

* `db` · `backend`(migrate 후 start) · `frontend`(standalone)
* 호스트 포트 기본: FE 3000, BE 4000, DB 5433

---

## 도메인 요약

* **User:** email, password_hash, nickname(표시), urlSlug(주소용 ASCII), emailVerified
* **Blog:** type `personal` | `team`, slug, description; team은 멤버십·초대
* **Post:** blog 소속; personal만 trending 노출 옵션; view는 IP 단위 완화 가능
* **Comment:** post 소속; 작성자만 수정·삭제

공유 URL 해석: `GET /api/blogs/resolve` + 프론트 vanity path (`ownerUrlSlug` / team slug).

---

## 데이터 흐름 개요

1. 브라우저가 Next origin에서 API origin으로 cross-origin 요청 (로컬: 3000 → 4000)
2. CORS + Cookie → 미들웨어가 access JWT 검증 (또는 optional)
3. Service가 소유권·멤버십 검사 후 Repository 호출
4. 이메일 발송이 필요하면 EmailSender (console 또는 Resend)

상세 경로·신뢰 경계는 `network-flow.md`.

---

## 설계 결정 이력

| 날짜 | 결정 | 이전 선택 | 변경 이유 |
|------|------|-----------|-----------|
| 2026-08-12 | 설계 문서를 `architecture.md` 등으로 분리 | 단일 로그에 혼재 가능 | 과정 기록과 현재 설계를 분리 |
| 2026-08 | Next / Express / PostgreSQL / 계층 분리 확정 | 미정 | 과제 스택·설명 가능성 (STEP 03) |
| 2026-08 | JWT를 HttpOnly Cookie로 전환 | Bearer+메모리 초안 | XSS 완화·과제 Cookie 요구 (STEP 09–10) |
| 2026-09 | Docker Compose에 fe+be+db | DB만 Compose | 환경 통일·컨테이너 운영 학습 |
| 2026-09 | 개인/팀 블로그·초대·resolve URL | 단일 게시판 | 공간·멤버십·공유 주소 학습 |
| 2026-09 | refresh 토큰 + 로테이션 | access만 | 짧은 access TTL·재사용 탐지 |
| 2026-09 | nickname과 urlSlug 분리 | 닉=URL 혼용 | 한글 표시명 + ASCII 주소 |

---

## 관련 문서

* `ai-development-log.md` — 질문 / 명령 / 결과 / 검증
* `api-spec.md` — API 설계
* `security.md` — 보안 설계 및 검토
* `network-flow.md` — 네트워크 흐름
* 루트 `README.md` — 프로젝트 개요
