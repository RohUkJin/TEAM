# Security

## 문서 목적

**어떤 보안 결정을 했는가**와 그 검토 결과를 기록한다.

인증(Authentication), 인가(Authorization), 토큰/쿠키, CORS, CSRF, XSS, SQL Injection, IDOR/BOLA 등
보안·네트워크에 영향을 주는 결정은 이 문서에 남긴다.
과정은 `ai-development-log.md`를 본다.

---

## 현재 상태

> Access + Refresh를 HttpOnly Cookie로 전달한다.  
> `requireAuth` / `optionalAuth` 및 리소스 소유권·팀 멤버십 검사가 적용되어 있다.  
> CSRF 전용 토큰·rate limit·보안 헤더는 아직 미도입 (STEP 24 감사에서 잔여로 기록).  
> production에서는 `COOKIE_SECURE=true`·`EMAIL_TRANSPORT=resend`가 강제된다.

---

## 보안 원칙

* 권한 검증은 클라이언트만이 아니라 서버에서 수행한다.
* 비밀값(토큰, 비밀번호, 키)은 학습 로그/문서에 실값을 기록하지 않는다.
* 비밀번호는 bcrypt 해시만 저장한다.
* JWT payload에는 최소 정보(userId/exp 등)만 넣는다.
* refresh 원문은 DB에 해시로 저장하고, 로테이션·재사용 탐지를 적용한다.

---

## 인증 (Authentication)

* **선택:** JWT (HS256) + HttpOnly Cookie `access_token`
* **Refresh:** HttpOnly Cookie `refresh_token` + DB 저장(해시) + 로테이션  
  * 폐기된 refresh 재제시 → 해당 유저 refresh 전부 폐기 (`TOKEN_REUSE` 등)
* 로그인: `POST /api/auth/login` (이메일 미인증 → 403)
* 재발급: `POST /api/auth/refresh`
* 로그아웃: `POST /api/auth/logout`
* 현재 사용자: `GET /api/auth/me`

### 이메일 인증

* 가입 시 토큰 발급 → `EMAIL_TRANSPORT=console`이면 서버 로그(+ 개발 시 응답 토큰 가능) / `resend`면 실메일
* 인증 전 로그인 불가

---

## 인가 (Authorization)

| 자원 | 규칙 |
|------|------|
| 게시글 작성 | 로그인 + 해당 블로그 멤버(개인=소유) |
| 게시글 수정/삭제 | `assertResourceOwner` (작성자) |
| 댓글 작성 | 로그인 (+ 글 가독성 전제) |
| 댓글 수정/삭제 | 작성자 |
| 팀 블로그 본문 | 멤버만 (`TEAM_BLOG_LOCKED` 등) |
| 팀 초대 발급 / 소개 수정 | 소유자 |
| 팀 가입 | 로그인 + 유효 1회용 초대코드 |

* 실패: `403 FORBIDDEN` (인증은 됐으나 권한 없음) 또는 정책에 따른 잠금 응답
* Frontend 버튼 숨김만으로 권한을 판단하지 않음

---

## 토큰 / 쿠키

| 속성 | development | production (기본) | 이유 |
|------|-------------|-------------------|------|
| HttpOnly | true | true | `document.cookie`로 JWT 읽기 불가 (XSS 완화) |
| Secure | false (`COOKIE_SECURE=false`) | true (미설정 시 기동 거부) | HTTPS에서만 전송 |
| SameSite | lax | lax (`COOKIE_SAMESITE`) | CSRF 완화. 완전 차단은 아님 |
| Path | `/` | `/` | API 요청에 쿠키 포함 |
| Access Max-Age | `JWT_EXPIRES_IN_SECONDS` (기본 900) | 동일 | 짧은 TTL |
| Refresh Max-Age | `REFRESH_TOKEN_EXPIRES_IN_SECONDS` (기본 7일) | 동일 | 재발급용 |

* `SameSite=None`이면 반드시 `Secure=true` (코드 검증)
* JWT/refresh 원문은 성공 로그인 JSON body에 넣지 않음

### localStorage 대비

* Cookie+HttpOnly: JS가 토큰을 직접 읽지 못함
* localStorage: XSS 시 토큰 탈취에 취약 → 기본 선택에서 제외
* Cookie 단점: CSRF 표면 → SameSite + (미도입) CSRF 토큰으로 단계적 대응

---

## CORS

* `FRONTEND_ORIGIN`만 허용
* `credentials: true` (Cookie 전송 전제)

---

## 기타 도메인 보안

* 초대코드: 해시 저장, 1회용, TTL(24h), 팀당 미사용 복수 허용(정책 변경 이력은 로그 STEP)
* urlSlug: ASCII만 — 경로 주입·한글 URL 이슈 완화
* 조회수: IP 단위 중복 완화 (남용 완전 방지는 아님)
* Swagger UI: 현재 상시 공개 — 운영에서는 차단·인증 검토 여지 (STEP 24)

---

## 주요 위협 검토 체크리스트

| 위협 | 현재 대응 | 상태 | 비고 |
|------|-----------|------|------|
| XSS | HttpOnly Cookie, body에 JWT 미포함 | 부분 완화 | 출력 sanitization은 추가 과제 |
| CSRF | SameSite=Lax | 부분 완화 | CSRF 토큰 미도입 |
| SQL Injection | 파라미터 바인딩 | 적용 | |
| IDOR / BOLA | 소유권·멤버십 서버 검사 | 적용 | 게시글/댓글/팀 |
| Refresh 탈취·재사용 | 해시 저장 + 로테이션 + reuse 시 전면 폐기 | 적용 | |
| 비밀정보 노출 | .env, hash 저장 | 부분 | 약한 secret·DB 비번 운영 주의 |
| CORS 오구성 | Origin 제한 + credentials | 적용 | |
| 브루트포스 | — | 미적용 | rate limit 없음 (STEP 24) |
| 메일/토큰 로그 | console transport만 개발 편의 | 부분 | production은 resend 강제 |

---

## 설계 결정 이력

| 날짜 | 결정 | 이전 선택 | 변경 이유 |
|------|------|-----------|-----------|
| 2026-08-12 | 보안 설계를 `security.md`로 분리 | 미분리 | 추적 |
| 2026-08-21 | JWT를 HttpOnly Cookie로 전달 | Bearer+메모리 추천안 | STEP 요구·XSS 완화 |
| 2026-08-21 | Cookie Secure/SameSite를 env로 분리 | 코드 하드코드 | 개발/운영 구분 |
| 2026-09 | refresh + 재사용 탐지 | access만 | 짧은 access·세션 통제 |
| 2026-09 | production `COOKIE_SECURE` / Resend 강제 | 느슨한 기본값 | 운영 오구성 방지 |
| 2026-09 | 팀 블로그 멤버십·초대 해시 | 전체 공개 게시판 | 공간 단위 인가 |

---

## 관련 문서

* `ai-development-log.md` — 질문 / 명령 / 결과 / 검증
* `architecture.md` — 현재 시스템 설계
* `api-spec.md` — API 설계
* `network-flow.md` — 네트워크 흐름
