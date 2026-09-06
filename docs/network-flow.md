# Network Flow

## 문서 목적

**요청이 어떻게 이동하는가**를 기록한다.

브라우저 → 프론트엔드 → API → 서비스 → DB / 외부 시스템까지의
요청·응답 경로, 프로토콜, 신뢰 경계, Docker/Cloud 네트워크 관계를 설명한다.

---

## 현재 상태

> 로컬(npm)과 Docker Compose 토폴로지가 확정되어 있다.  
> 클라우드(공개 HTTPS·리버스 프록시)는 **미배포**. 아래 체크리스트만 준비한다.

---

## 고수준 흐름

1. Client(Browser)가 Frontend origin(예: `http://localhost:3000`)에서 UI 로드
2. Browser가 Backend origin(예: `http://localhost:4000`)으로 `fetch` + `credentials: "include"`
3. CORS가 `FRONTEND_ORIGIN`을 확인하고 Cookie를 허용
4. Express 미들웨어가 Cookie의 access JWT를 검증(또는 optional)
5. Service → Repository → PostgreSQL
6. 필요 시 Resend(외부 HTTPS)로 메일 발송
7. 응답 JSON (+ Set-Cookie on login/refresh/logout)이 Client로 반환

```text
[Browser]
   |  HTTP (local) / HTTPS (목표 운영)
   v
[Next.js :3000]          (정적·SSR UI)
   |  XHR/fetch + Cookie
   v
[Express :4000 /api]     (공개 API)
   |                     |
   v                     v
[PostgreSQL]           [Resend API]  (EMAIL_TRANSPORT=resend일 때)
```

Docker Compose에서는 `backend`↔`db`가 브리지 네트워크의 호스트명 `db:5432`로 통신하고,  
브라우저는 호스트에 노출된 `3000`/`4000`만 본다.

---

## 신뢰 경계 (Trust Boundaries)

| 구역 | 신뢰 | 비고 |
|------|------|------|
| Browser | 비신뢰 | XSS·위조 요청 가능 → 서버 인가 필수 |
| Frontend origin | 반신뢰 | CORS allowlist의 한쪽 |
| Backend API | 신뢰 경계 내부의 서버 | 비밀·DB 접근 |
| PostgreSQL | 백엔드만 접근 전제 | Compose에서 호스트 5433 노출은 로컬 편의 |
| Resend | 외부 SaaS | API 키·발신 도메인 관리 |

---

## 환경별 구성

| 환경 | Frontend | Backend | DB | 비고 |
|------|----------|---------|----|------|
| Local (npm) | localhost:3000 | localhost:4000 | localhost:5433 (Compose db만) | `COOKIE_SECURE=false`, 메일 console 가능 |
| Docker Compose | :3000 | :4000 | 컨테이너 `db:5432` / 호스트 5433 | `docker/.env` |
| Cloud | 미정 | 미정 | 미정 | **미착수** — 아래 체크리스트 |

---

## 주요 시나리오 흐름

### 회원가입 → 이메일 인증 → 로그인

1. `POST /api/auth/register` → users + verification token; EmailSender
2. 사용자가 메일(또는 console/dev 토큰)로 `POST /api/auth/verify-email`
3. `POST /api/auth/login` → Set-Cookie: `access_token`, `refresh_token`
4. 이후 API는 Cookie 자동 첨부; `GET /api/auth/me`로 UI 세션 동기화

실패: 미인증 로그인 403, 잘못된 토큰 400, 중복 이메일 409

### 보호된 리소스 (글 수정)

1. Browser → `PUT /api/posts/{id}` + access Cookie
2. `requireAuth` 실패 시 401
3. Service 소유권 검사 실패 시 403
4. 성공 시 DB update

Frontend Guard를 우회해도 서버에서 동일하게 거절되어야 한다.

### Access 만료 → Refresh

1. access 만료로 401
2. `POST /api/auth/refresh` (refresh Cookie)
3. 새 access+refresh Set-Cookie (로테이션)
4. 폐기된 refresh 재사용 시 해당 유저 세션 전부 폐기 → 401

### 팀 블로그 잠금

1. 비멤버가 `GET /api/blogs/{id}` 또는 팀 글 조회
2. 서버가 멤버십 없으면 잠금/403 정책 적용
3. 초대코드 `POST .../join` 후 멤버로 재요청

---

## Docker / Cloud Network 메모

### Docker (적용)

* 서비스: `db`, `backend`, `frontend`
* 공개 포트: FE/BE/DB(호스트) — 로컬 학습용. 운영에서는 DB 포트 비공개 권장
* backend 기동: migrate → `node dist/index.js`
* 컨테이너 간 DB URL 호스트는 `db` (localhost 아님)

### Cloud 배포 체크리스트 (미실시)

실서버에 올릴 때 최소 확인:

- [ ] HTTPS 종료(리버스 프록시 또는 플랫폼 TLS)
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_ORIGIN=https://<프론트 도메인>` (trailing slash 없음)
- [ ] `NEXT_PUBLIC_API_BASE_URL=https://<API 도메인>/api` (이미지 빌드 arg 포함)
- [ ] `COOKIE_SECURE=true`, `COOKIE_SAMESITE=lax` (또는 정책에 맞는 값)
- [ ] `JWT_SECRET` 강한 난수, DB 비밀번호 교체
- [ ] `EMAIL_TRANSPORT=resend`, `RESEND_API_KEY`, 검증된 `EMAIL_FROM`
- [ ] DB를 퍼블릭 포트로 열지 않음
- [ ] Swagger(`/api/docs`) 공개 범위 결정
- [ ] (여지) rate limit, CSRF 토큰, 보안 헤더 — `security.md` 잔여

참고 env 템플릿: `backend/.env.production.example`, `docker/.env.example` 하단 주석.

---

## 설계 결정 이력

| 날짜 | 결정 | 이전 선택 | 변경 이유 |
|------|------|-----------|-----------|
| 2026-08-12 | 네트워크 흐름을 `network-flow.md`로 분리 | 미분리 | 요청 경로·신뢰 경계 추적 |
| 2026-08 | FE/BE origin 분리 + CORS credentials | 동일 오리진만 | Cookie 기반 API |
| 2026-09 | Compose에 fe+be+db | db만 | 풀스택 컨테이너 경로 확정 |
| 2026-09 | 클라우드 체크리스트만 문서화 | 실배포 | Docker 이후 단계로 분리 |

---

## 관련 문서

* `ai-development-log.md` — 질문 / 명령 / 결과 / 검증
* `architecture.md` — 현재 시스템 설계
* `api-spec.md` — API 설계
* `security.md` — 보안 설계 및 검토
* 루트 `README.md` — 실행·문서 지도
