# TEAM (fullstack study)

개인/팀 블로그 공간을 중심으로 한 풀스택 학습 프로젝트다.  
코드만 동작하는 산출물이 아니라, **설계 판단을 설명하고 개발 과정을 재현할 수 있는 상태**를 목표로 한다.

## 개발 과정 문서화

이 저장소는 구현과 함께 **`docs/`에 학습·개발 과정**을 남긴다.

| 구분 | 어디에 | 무엇을 |
|------|--------|--------|
| **과정** | [`docs/ai-development-log.md`](docs/ai-development-log.md) | STEP별 질문 → 이론 → 설계 판단·이유 → AI(Cursor) 명령 → 구현 → 검증 · 설계 설명 포인트 |
| **현재 설계** | [`architecture`](docs/architecture.md) · [`api-spec`](docs/api-spec.md) · [`security`](docs/security.md) · [`network-flow`](docs/network-flow.md) | 지금 시스템이 어떻게 되어 있는가 (source of truth) |

원칙:

* AI에게 맡긴 구현이라도, **무엇을 골랐는지 / 왜 골랐는지 / 무엇을 검증했는지**를 사람이 기록한다.
* 과정 로그와 현재 설계 문서를 섞지 않는다. 설계가 바뀌면 설계 문서를 갱신하고, 의사결정은 로그 STEP에 남긴다.
* 보안·네트워크 판단(쿠키, CORS, 인가, Docker 토폴로지 등)도 단계마다 남긴다.

스택 선택의 한 줄 요약은 아래 표에, 단계별 근거와 프롬프트·검증은 **AI development log**에 있다.

## 범위

**포함:** 회원가입 · 이메일 인증 · JWT(HttpOnly Cookie) 로그인 · 개인/팀 블로그 · 게시글 CRUD · 댓글 · 페이징 · Swagger · Docker Compose

**의도적 미포함:** 좋아요, 검색, 파일 업로드, OAuth, 실시간 알림 등 선택 기능

**배포:** Docker까지 구성 완료. 클라우드(Oracle/AWS 등) 실배포는 미착수 — 체크리스트는 `docs/network-flow.md` 참고.

## 기술 스택 (선택 · 대안 · 이유)

| 영역 | 선택 | 대안 | 한 줄 이유 |
|------|------|------|------------|
| Frontend | Next.js + TypeScript | Nuxt, CRA | App Router·SSR/정적 학습과 과제 스택 고정 |
| FE 상태 | Zustand (인증 UI) | Redux, Context만 | 서버 데이터는 요청 단위 조회, 전역은 세션 UI만 |
| Backend | Express + TypeScript | FastAPI, Nest | Node 풀스택·계층 분리 설명에 적합, 학습 곡선 관리 |
| DB | PostgreSQL + SQL migration | MySQL, Mongo, ORM | 관계·FK를 SQL로 직접 읽고 설명하기 위함 |
| Auth | JWT HS256 + HttpOnly Cookie | Bearer+메모리, localStorage | XSS 시 토큰 탈취 완화; CSRF는 SameSite 등으로 단계적 대응 |
| Refresh | DB 저장 refresh + 로테이션 | access만 장기 유지 | access 짧은 TTL + 재사용 탐지 |
| 비밀번호 | bcrypt | 평문/약한 해시 | 해시만 저장 |
| 메일 | Resend (운영) / console (로컬) | SMTP 직접 | 실발송·개발 로그를 transport로 분리 |
| API 문서 | OpenAPI + Swagger UI | 수동 markdown만 | 구현과 문서 동기화·계약 확인 |
| Infra | Docker Compose (fe+be+db) | 로컬만 | 환경 의존성 제거·컨테이너 운영 이해 |
| Cloud | 미착수 | Oracle / AWS | Docker 이후 단계 |

## 문서 지도

| 문서 | 역할 |
|------|------|
| [`docs/ai-development-log.md`](docs/ai-development-log.md) | **개발 과정 (STEP 01–28)** — 학습 질문·이론·설계·명령·검증 |
| [`docs/architecture.md`](docs/architecture.md) | **현재** 시스템 구조·계층·컴포넌트 |
| [`docs/api-spec.md`](docs/api-spec.md) | **현재** API 공통 계약·엔드포인트 목록 (상세는 Swagger) |
| [`docs/security.md`](docs/security.md) | **현재** 인증·인가·쿠키·위협 대응 |
| [`docs/network-flow.md`](docs/network-flow.md) | **현재** 요청 경로·신뢰 경계·환경별 토폴로지·배포 체크리스트 |

처음 읽는 순서 추천: **이 README → AI development log(관심 STEP) → architecture / security** → 필요 시 api-spec · Swagger.

## 로컬 실행 (개발)

사전 요구: Node.js 22+, Docker (DB 또는 풀스택)

```powershell
# 1) DB만 Docker로
cd docker
copy .env.example .env   # 최초 1회
docker compose up -d db

# 2) Backend
cd ..\backend
copy .env.example .env   # 최초 1회, JWT_SECRET 등 설정
npm install
npm run db:migrate
npm run dev
# http://localhost:4000  /  Swagger: http://localhost:4000/api/docs

# 3) Frontend
cd ..\frontend
copy .env.example .env.local
npm install
npm run dev
# http://localhost:3000
```

## Docker 풀스택

```powershell
cd docker
copy .env.example .env   # 최초 1회
docker compose --env-file .env up -d --build
```

| 서비스 | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend / Health | http://localhost:4000/api/health |
| Swagger | http://localhost:4000/api/docs |
| PostgreSQL (호스트) | localhost:5433 |

### AWS EC2 데모 배포

`docker/docker-compose.ec2.yml`은 Nginx를 추가해 인터넷에는 80번 포트만 공개하고,
frontend/backend/PostgreSQL 포트는 EC2의 loopback에만 바인딩한다.

```bash
cd docker
cp .env.ec2.example .env
# .env의 PUBLIC_IP 두 곳과 DB/JWT 난수 값을 수정
docker compose --env-file .env -f docker-compose.yml -f docker-compose.ec2.yml up -d --build
```

이 구성은 도메인·TLS 전 학습용 HTTP 데모다. 실제 운영 전환 시 HTTPS를 먼저 붙이고
`NODE_ENV=production`, `COOKIE_SECURE=true`, Resend 설정을 적용한다.

환경변수 예시: [`backend/.env.example`](backend/.env.example), [`backend/.env.production.example`](backend/.env.production.example), [`docker/.env.example`](docker/.env.example)

## API 상세

요청/응답 스키마·Try it out은 **Swagger**가 정본이다.

- UI: http://localhost:4000/api/docs  
- 요약·목록: [`docs/api-spec.md`](docs/api-spec.md)
