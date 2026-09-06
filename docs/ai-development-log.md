# AI Development Log

## 프로젝트 원칙

이 프로젝트의 핵심 원칙:

> AI가 구현하고, 사람이 설계와 판단을 담당한다.

AI에게 단순히 "만들어줘"라고 지시하는 것을 지양하고,
구현에 필요한 이론과 설계 의도를 먼저 확인한 뒤 구체적인 구현 지시를 한다.

개발 과정은 다음 흐름을 문서로 남긴다.

> 질문 → 이론 → 설계 판단 → AI 명령 → 구현 → 검증

## 문서 구조

설계 자체는 별도 문서로 분리한다.

```text
README.md                       ← 프로젝트 개요 (스택 선택·문서 지도·실행)
docs/
├── ai-development-log.md      ← 질문 / 명령 / 결과 / 검증
├── architecture.md            ← 현재 시스템 설계
├── api-spec.md                ← API 설계
├── security.md                ← 보안 설계 및 검토
└── network-flow.md            ← 네트워크 흐름
```

역할 구분:

* 루트 `README.md` — 프로젝트 개요 (선택·대안·이유 + 문서 링크)
* `ai-development-log.md` — 내가 어떻게 생각하고 AI에게 무엇을 시켰는가
* `architecture.md` — 현재 시스템은 어떻게 설계되어 있는가
* `api-spec.md` — 어떤 API를 만들었는가
* `security.md` — 어떤 보안 결정을 했는가
* `network-flow.md` — 요청이 어떻게 이동하는가

과정 기록과 현재 설계를 섞지 않는다.
설계가 바뀌면 해당 설계 문서를 갱신하고, 의사결정 과정은 이 로그의 STEP에 남긴다.

---

# STEP 기록

각 단계는 다음 형식으로 기록한다.

## STEP XX - [단계명]

### 1. 학습 질문

이번 단계에서 사람이 먼저 확인한 질문을 기록한다.

* 질문 내용

### 2. 학습한 이론

질문에 대한 핵심 이론을 간결하게 기록한다.

### 3. 설계 판단

이번 프로젝트에서 어떤 설계를 선택했는지 기록한다.

예:

* JWT 사용
* HttpOnly Cookie 사용
* Backend에서 Authorization 검증
* Zustand에서 인증 상태 관리

### 4. 설계 이유

왜 해당 설계를 선택했는지 기록한다.

다른 선택지가 있다면 무엇이 있었고 왜 선택하지 않았는지도 기록한다.

### 5. Cursor에게 전달한 명령

실제로 Cursor에게 전달한 프롬프트를 원문 그대로 기록한다.

### 6. Cursor 구현 결과

Cursor가 실제로 구현한 내용을 기록한다.

변경된 주요 파일과 핵심 구현 내용을 기록한다.

### 7. 검증

구현이 요구사항대로 동작하는지 기록한다.

* 기능 테스트
* API 테스트
* 예외 테스트
* 보안 테스트

### 8. 발견된 문제와 수정

구현 과정에서 발견된 문제와 해결 방법을 기록한다.

### 9. 설계 설명 포인트

이 단계에서 설계·구현을 설명할 때 핵심이 되는 질문과
내가 설명할 수 있어야 하는 답변의 핵심을 기록한다.

---

## 기록 규칙

앞으로 새로운 단계의 작업을 수행할 때마다 이 문서를 업데이트한다.

중요한 규칙:

1. 실제 Cursor에게 전달한 명령을 임의로 요약하지 않는다.
2. 가능한 한 실제 명령 원문을 기록한다.
3. 설계 변경이 발생하면 기존 설계를 삭제하지 않는다.
4. "처음에는 A로 설계했지만 B로 변경했다"는 의사결정 과정도 기록한다.
5. 단순 코드 변경보다 설계 판단과 그 이유를 중요하게 기록한다.
6. 보안 및 네트워크 관련 판단은 반드시 기록한다.
7. 구현 결과와 사람이 처음 의도한 설계를 구분해서 기록한다.
8. Cursor가 임의로 추가한 기능이나 설계가 있다면 반드시 기록하고 검토 대상으로 표시한다.
9. 아직 확인하지 않은 내용은 확인한 것처럼 작성하지 않는다.
10. 모든 단계가 끝난 후에도 기존 기록을 삭제하거나 덮어쓰지 않는다.

코드 구현과 학습 기록 업데이트는 별개의 작업으로 취급한다.
코드 구현이 완료되었다고 해서 기록을 생략하지 않는다.

---

# 실제 STEP 로그

아래부터는 실제 작업 단계 기록이다.
기존 단계는 삭제하거나 덮어쓰지 않는다.

---

## STEP 01 - AI 개발 학습 기록 시스템 구축

### 1. 학습 질문

* AI가 코드를 생성하더라도, 사람이 이론을 이해하고 설계를 결정한 과정을 어떻게 남길 것인가?
* 구현 결과와 설계 의도를 어떻게 구분해서 기록할 것인가?
* Cursor에게 전달한 명령을 왜 원문 그대로 남겨야 하는가?

### 2. 학습한 이론

* AI 활용 개발에서 핵심은 "결과 코드"보다 "왜 그렇게 구현했는지"를 설명하는 능력이다.
* 학습 기록은 `질문 → 이론 → 설계 판단 → AI 명령 → 구현 → 검증` 순서로 남겨야, 나중에 회고에서 의사결정 과정을 재현할 수 있다.
* 명령 원문을 남기면, AI가 임의로 확장한 부분과 사람이 지시한 범위를 구분할 수 있다.

### 3. 설계 판단

* 프로젝트 루트에 `docs/ai-development-log.md`를 둔다.
* 문서는 템플릿(단계 형식)과 실제 STEP 로그를 한 파일에 함께 둔다.
* 이후 모든 작업이 끝날 때마다 이 문서를 업데이트한다.
* 코드 구현과 학습 기록을 별도 작업으로 취급한다.

### 4. 설계 이유

* 단일 로그 파일로 두면 단계별 의사결정 흐름을 시간순으로 추적하기 쉽다.
* 템플릿과 실제 로그를 분리하지 않은 이유: 새 단계 작성 시 형식을 바로 참고할 수 있다.
* 단계별 파일을 나누는 방식(`docs/steps/step-01.md` 등)도 가능했으나, 이번 요구사항이 단일 문서 생성을 명시했으므로 따르지 않았다.

### 5. Cursor에게 전달한 명령

```text
# AI 개발 학습 기록 시스템 구축

이번 프로젝트에서는 AI가 단순히 코드를 생성하는 것이 아니라,
사람이 이론을 이해하고 설계 방향을 결정한 뒤 AI에게 구현을 지시하는 방식으로 개발한다.

따라서 앞으로 모든 개발 과정에서 "질문 → 이론 → 설계 판단 → AI 명령 → 구현 → 검증"의 과정을 문서로 남긴다.

프로젝트 루트에 다음 문서를 생성해줘.

docs/
└── ai-development-log.md

이 문서는 이번 프로젝트의 AI 활용 및 학습 기록이다.

다음 구조로 작성한다.

# AI Development Log

## 프로젝트 원칙

이 프로젝트의 핵심 원칙:

> AI가 구현하고, 사람이 설계와 판단을 담당한다.

AI에게 단순히 "만들어줘"라고 지시하는 것을 지양하고,
구현에 필요한 이론과 설계 의도를 먼저 확인한 뒤 구체적인 구현 지시를 한다.

---

# STEP 기록

각 단계는 다음 형식으로 기록한다.

## STEP XX - [단계명]

### 1. 학습 질문

이번 단계에서 사람이 먼저 확인한 질문을 기록한다.

* 질문 내용

### 2. 학습한 이론

질문에 대한 핵심 이론을 간결하게 기록한다.

### 3. 설계 판단

이번 프로젝트에서 어떤 설계를 선택했는지 기록한다.

예:

* JWT 사용
* HttpOnly Cookie 사용
* Backend에서 Authorization 검증
* Zustand에서 인증 상태 관리

### 4. 설계 이유

왜 해당 설계를 선택했는지 기록한다.

다른 선택지가 있다면 무엇이 있었고 왜 선택하지 않았는지도 기록한다.

### 5. Cursor에게 전달한 명령

실제로 Cursor에게 전달한 프롬프트를 원문 그대로 기록한다.

### 6. Cursor 구현 결과

Cursor가 실제로 구현한 내용을 기록한다.

변경된 주요 파일과 핵심 구현 내용을 기록한다.

### 7. 검증

구현이 요구사항대로 동작하는지 기록한다.

* 기능 테스트
* API 테스트
* 예외 테스트
* 보안 테스트

### 8. 발견된 문제와 수정

구현 과정에서 발견된 문제와 해결 방법을 기록한다.

### 9. 설계 설명 포인트

이 단계에서 설계·구현을 설명할 때 핵심이 되는 질문과
내가 설명할 수 있어야 하는 답변의 핵심을 기록한다.

---

## 기록 규칙

앞으로 새로운 단계의 작업을 수행할 때마다 이 문서를 업데이트한다.

중요한 규칙:

1. 실제 Cursor에게 전달한 명령을 임의로 요약하지 않는다.
2. 가능한 한 실제 명령 원문을 기록한다.
3. 설계 변경이 발생하면 기존 설계를 삭제하지 않는다.
4. "처음에는 A로 설계했지만 B로 변경했다"는 의사결정 과정도 기록한다.
5. 단순 코드 변경보다 설계 판단과 그 이유를 중요하게 기록한다.
6. 보안 및 네트워크 관련 판단은 반드시 기록한다.
7. 구현 결과와 사람이 처음 의도한 설계를 구분해서 기록한다.
8. Cursor가 임의로 추가한 기능이나 설계가 있다면 반드시 기록하고 검토 대상으로 표시한다.
9. 아직 확인하지 않은 내용은 확인한 것처럼 작성하지 않는다.
10. 모든 단계가 끝난 후에도 기존 기록을 삭제하거나 덮어쓰지 않는다.

앞으로 내가 새로운 작업을 요청할 때마다,
해당 작업이 끝난 후 이 문서를 함께 업데이트해줘.

중요:
코드를 구현하는 것과 학습 기록을 작성하는 것을 별개의 작업으로 취급한다.
코드 구현이 완료되었다고 해서 기록을 생략하지 않는다.
```

### 6. Cursor 구현 결과

* 생성 파일: `docs/ai-development-log.md`
* 포함 내용:
  * 프로젝트 원칙
  * STEP 기록 템플릿
  * 기록 규칙
  * 실제 STEP 로그 섹션
  * STEP 01 기록

#### Cursor가 임의로 추가한 부분 (검토 대상)

* `# 실제 STEP 로그` 섹션 헤더를 추가했다. 요구사항에는 템플릿만 명시되어 있었으나, 템플릿과 실제 기록을 구분하기 위해 넣었다.
* STEP 01 자체를 이 문서에 바로 기록했다. 요청에 "작업이 끝난 후 이 문서를 함께 업데이트"가 포함되어 있어 반영했다.

### 7. 검증

* 기능 테스트: `docs/ai-development-log.md` 파일 존재 확인 필요
* API 테스트: 해당 없음 (문서 작업)
* 예외 테스트: 해당 없음
* 보안 테스트: 해당 없음 (비밀정보/인증 로직 없음)

### 8. 발견된 문제와 수정

* 현재까지 발견된 문제 없음.
* 템플릿과 실제 로그를 한 파일에 둘지 여부는 요구사항에 명시되지 않았으나, 단일 문서 생성 요구에 맞춰 같은 파일에 기록했다.

### 9. 설계 설명 포인트

* Q: 왜 AI에게 바로 구현을 시키지 않고 학습 로그를 남기는가?
  * A: 동작하는 코드뿐 아니라, 설계 선택과 보안/네트워크 판단 이유를 설명할 수 있어야 한다.
* Q: 왜 Cursor 명령을 원문으로 남기는가?
  * A: AI가 지시한 범위를 넘어 임의 추가했는지 검증하고, 사람 의도와 구현 결과를 분리하기 위해서다.
* Q: 설계가 바뀌면 이전 기록을 지워도 되는가?
  * A: 안 된다. 변경 과정도 학습 자산이므로 "A → B"로 남긴다.

---

## STEP 02 - 설계 문서 분리

### 1. 학습 질문

* 과정 기록(질문/명령/검증)과 현재 설계를 한 파일에 두면 어떤 문제가 생기는가?
* 아키텍처, API, 보안, 네트워크 흐름을 왜 문서로 나눠야 하는가?
* 아직 시스템이 없을 때 설계 문서를 어떻게 작성해야 하는가?

### 2. 학습한 이론

* 학습 로그는 "시간에 따른 의사결정 과정"이고, 설계 문서는 "현재 시스템의 진실(source of truth)"에 가깝다.
* 문서 역할을 분리하면 "왜 이렇게 했는가"와 "지금 시스템이 어떻게 되어 있는가"를 각각 설명할 수 있다.
* 확인되지 않은 설계를 확정된 것처럼 쓰면 이후 구현/보안 판단이 왜곡된다.

### 3. 설계 판단

* `docs/` 아래에 설계 문서를 분리한다.
  * `architecture.md`
  * `api-spec.md`
  * `security.md`
  * `network-flow.md`
* `ai-development-log.md`는 과정 기록 전용으로 유지한다.
* 아직 미정인 항목은 "미정/미설계"로 명시하고, 가짜 스택·가짜 API를 넣지 않는다.

### 4. 설계 이유

* 한 파일에 모두 두면 단계가 늘어날수록 "현재 유효한 설계"를 찾기 어렵다.
* 반대로 과정 로그를 설계 문서에만 남기면 명령 원문과 시행착오가 사라진다.
* 선택하지 않은 대안: 설계를 계속 `ai-development-log.md`에만 누적하기 — 요구사항이 명시적 분리를 지시했으므로 채택하지 않음.

### 5. Cursor에게 전달한 명령

```text
docs/
├── ai-development-log.md      ← 질문/명령/결과/검증
├── architecture.md            ← 현재 시스템 설계
├── api-spec.md                ← API 설계
├── security.md                ← 보안 설계 및 검토
└── network-flow.md             ← 네트워크 흐름

설계 자체를 별도 문서로 분리. 

ai-development-log.md

내가 어떻게 생각하고 AI에게 무엇을 시켰는가

architecture.md

현재 시스템은 어떻게 설계되어 있는가

api-spec.md

어떤 API를 만들었는가

security.md

어떤 보안 결정을 했는가

network-flow.md

요청이 어떻게 이동하는가
```

### 6. Cursor 구현 결과

* 생성/갱신 파일:
  * `docs/architecture.md` (신규)
  * `docs/api-spec.md` (신규)
  * `docs/security.md` (신규)
  * `docs/network-flow.md` (신규)
  * `docs/ai-development-log.md` (문서 구조 섹션 추가 + STEP 02 기록)

#### Cursor가 임의로 추가한 부분 (검토 대상)

* 각 설계 문서에 "현재 상태: 미정", 섹션 골격, 설계 결정 이력 표를 넣었다. 요구사항은 파일 분리와 역할 정의였고, 세부 섹션 구조는 AI가 구성했다.
* `ai-development-log.md`에 `## 문서 구조` 안내를 추가했다.

### 7. 검증

* 기능 테스트: 요청된 5개 문서 경로가 존재하는지 확인
* API 테스트: 해당 없음
* 예외 테스트: 해당 없음
* 보안 테스트: 설계 문서에 허위 확정 보안 결정을 넣지 않았는지 확인 (미정으로 표기)

### 8. 발견된 문제와 수정

* 문제: 애플리케이션이 아직 없어 실제 아키텍처/API/네트워크를 기술할 수 없음.
* 대응: 확정된 것처럼 쓰지 않고 스켈레톤 + 미정 상태로 작성.

### 9. 설계 설명 포인트

* Q: 왜 로그와 설계 문서를 나누었는가?
  * A: 로그는 사고 과정, 설계 문서는 현재 시스템 상태를 나타내며 역할이 다르기 때문이다.
* Q: 아직 코드가 없는데 설계 문서를 만든 이유는?
  * A: 구현 전에 설계 판단의 저장 위치를 정해, 이후 결정을 누락 없이 남기기 위해서다.
* Q: 지금 문서를 보면 시스템이 JWT를 쓰는지 알 수 있는가?
  * A: 아니다. 아직 미정이며, 결정되는 시점에 `security.md`와 관련 문서에 기록한다.

---

## STEP 03 - 전체 아키텍처 설계

> 사용자 요청 제목: `STEP 01 - 전체 아키텍처 설계`  
> 로그상 번호는 기존 STEP 01/02(문서 체계 구축)를 덮어쓰지 않기 위해 STEP 03으로 기록한다.

### 1. 학습 질문

* 브라우저에서 API 요청이 발생하면 어떤 과정을 거치는가?
* 인증(Authentication)은 어디에서 처리하는가?
* 권한 검증(Authorization)은 어디에서 처리하는가?
* DB에는 어떤 데이터가 저장되는가?
* Frontend는 어떤 데이터를 상태로 관리하는가?
* Frontend에서 보안을 담당하면 안 되는 부분은 무엇인가?

### 2. 학습한 이론

* HTTP 요청은 Client → (네트워크) → API 서버 → 비즈니스 로직 → DB 순으로 처리되고, 응답이 역순으로 돌아온다.
* Authentication은 "누구인지 확인", Authorization은 "그 행동이 허용되는지 확인"이며 둘 다 서버에서 최종 강제해야 한다.
* Frontend 상태/UI 가드는 UX용일 뿐, 보안 경계가 아니다.
* JWT는 클라이언트가 보관·전송하고, 서버가 서명 검증과 인가를 수행한다.
* 비밀번호는 bcrypt 해시로만 저장하고, 이메일 인증 전에는 로그인 불가 같은 정책을 서버가 강제한다.

### 3. 설계 판단

* 스택(고정): Next.js+TS / Express+TS / PostgreSQL / JWT+bcrypt / REST / Docker / Cloud / GitHub Actions
* 필수 기능만 범위로 한다. (댓글 수정, OAuth, 실시간 등 제외)
* 모노레포 디렉터리: `frontend/`, `backend/`, `docs/`
* Backend 계층: Routes → Controllers → Services → Repositories → PostgreSQL
* 인증: 회원가입 → 이메일 인증 → 로그인 → JWT 발급
* JWT 전달 방식(추천안): Access Token을 `Authorization: Bearer`로 전송, Frontend 메모리(상태)에 보관
* 인가: Backend 미들웨어 + 리소스 소유권 검사 (게시글 수정/삭제, 댓글 삭제)
* 상태관리: 인증 UI 상태(사용자/토큰) + 서버 데이터는 페이지/요청 단위로 조회 (추가 선택 라이브러리 도입 안 함)
* API Layer(Frontend): `lib/api` 중앙 fetch 래퍼
* 에러: Backend 공통 에러 형식 + Frontend 상태코드별 처리
* Docker: `frontend`, `backend`, `db` 서비스
* 배포: Cloud Server에서 Docker Compose
* CI/CD: GitHub Actions로 테스트/빌드 후 서버 배포

### 4. 설계 이유

* Express 계층 분리는 인증/인가/CRUD 책임을 테스트·설명하기 쉽기 때문이다.
* JWT를 Bearer+메모리로 둔 이유: Cookie+CSRF까지 한 번에 넣으면 초기 학습 범위가 커진다. 대신 XSS 시 토큰 탈취 위험을 인지하고, localStorage는 기본 선택에서 제외했다.
* 선택하지 않은 대안:
  * localStorage JWT — XSS에 취약해 기본안으로 비추천
  * HttpOnly Cookie JWT — 보안상 우수하나 CSRF/CORS credentials 설계가 필수. 다음 보안 단계에서 전환 가능
  * Next.js API Routes를 BFF로 사용 — 필수 요구에 없고 복잡도 증가
* 댓글 Update 미포함: 요구사항에 작성/조회/삭제만 있음

#### 설계 변경

* 기존 설계: `architecture.md` 등 설계 문서 상태가 "미정"
* 변경 이유: 이번 단계에서 전체 아키텍처 설계안을 확정 후보로 제시
* 새로운 설계: 아래 STEP의 Cursor 구현 결과(채팅 설계안) 참고
* 참고: 이번 요청이 "코드/파일 생성 금지"였으므로 `architecture.md` / `security.md` / `network-flow.md` / `api-spec.md`는 아직 동기화하지 않음 (승인 후 반영 예정)

### 5. Cursor에게 전달한 명령

```text
# STEP 01 - 전체 아키텍처 설계

이번 단계에서는 코드를 작성하지 말고 전체 서비스 구조만 설계해줘.

과제의 필수 요구사항은 다음과 같다.

* 회원가입
* 이메일 인증
* 로그인
* JWT 기반 인증
* 게시글 CRUD
* 댓글 작성/조회/삭제
* Pagination
* Swagger
* Docker
* Cloud Server 배포
* GitHub Actions 자동 배포

선택 기능은 구현하지 않는다.

기술 스택은 다음으로 고정한다.

Frontend

* Next.js
* TypeScript

Backend

* Node.js
* Express.js
* TypeScript

Database

* PostgreSQL

Authentication

* JWT
* bcrypt

API

* REST API

Infrastructure

* Docker
* Cloud Server

CI/CD

* GitHub Actions

먼저 다음 내용을 설계해줘.

1. 전체 시스템 아키텍처
2. Frontend → Backend → Database 요청 흐름
3. 인증 흐름
4. 게시글 CRUD 흐름
5. 댓글 흐름
6. 상태관리 구조
7. API Layer 구조
8. 에러 처리 구조
9. Docker 구조
10. 배포 구조
11. GitHub Actions 구조

특히 다음 질문에 답할 수 있도록 설계해줘.

* 브라우저에서 API 요청이 발생하면 어떤 과정을 거치는가?
* 인증은 어디에서 처리하는가?
* 권한 검증은 어디에서 처리하는가?
* DB에는 어떤 데이터가 저장되는가?
* Frontend는 어떤 데이터를 상태로 관리하는가?
* Frontend에서 보안을 담당하면 안 되는 부분은 무엇인가?

아직 파일을 생성하거나 코드를 작성하지 마.

마지막에는 전체 아키텍처를 ASCII 다이어그램으로 보여줘.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* 애플리케이션 코드: 작성하지 않음 (요청대로)
* 설계 문서(`architecture.md` 등): 수정하지 않음 (요청대로 파일 생성/작성 금지)
* 변경 파일:
  * `docs/ai-development-log.md` — STEP 03 기록 추가
* 구현 내용: 채팅 응답으로 전체 아키텍처 설계안 제시 (ASCII 다이어그램 포함)

#### Cursor가 임의로 추가한 부분 (검토 대상)

* JWT 저장 위치를 "메모리 + Bearer 헤더"로 추천안으로 제시했다. 요구사항은 JWT 사용만 고정되어 있었고 저장소는 명시되지 않았다. **사람 승인 필요.**
* 이메일 인증을 "일회용 토큰 링크 + DB 저장 + TTL"로 구체화했다.
* 모노레포 디렉터리 구조를 제안했다.
* 로그 번호를 사용자 표기 STEP 01이 아닌 STEP 03으로 기록했다 (기존 기록 보존).

### 7. 검증

* 기능 테스트: 코드 없음 → 해당 없음
* API 테스트: 해당 없음
* 예외 테스트: 해당 없음
* 설계 검증: 필수 요구사항 대비 누락 여부 점검
  * 회원가입/이메일 인증/로그인/JWT/게시글 CRUD/댓글 작성·조회·삭제/Pagination/Swagger/Docker/Cloud/GitHub Actions → 설계에 포함
  * 선택 기능 미포함 확인 (댓글 수정, OAuth, Refresh Token 등 필수화하지 않음)

### 8. 발견된 문제와 해결 방법

* 문제: 사용자 STEP 번호(STEP 01)와 로그 기존 STEP 01이 충돌
* 해결: 기존 기록을 덮어쓰지 않고 STEP 03으로 추가, 사용자 제목을 병기
* 문제: JWT 저장소/이메일 전송 수단이 요구사항에 미명시
* 해결: 추천안을 제시하고 확정은 보류 (사람 판단 대기)
* 문제: 설계 문서 4종과 이번 설계안이 아직 불일치 가능
* 해결: 요청 범위상 이번엔 로그와 채팅만 갱신, 문서 동기화는 다음 단계로 분리

### 9. 보안상 고려한 사항

* 비밀번호는 bcrypt 해시로만 DB 저장
* 인증/인가의 최종 판단은 Backend
* 게시글/댓글 변경·삭제는 소유권 검사
* Frontend 버튼 숨김만으로 권한 제어하지 않음
* JWT를 localStorage 기본값으로 두지 않음 (추천: 메모리)
* 이메일 인증 전 로그인 제한
* Swagger/운영 환경 노출면은 배포 단계에서 재검토 필요
* 비밀키·SMTP 계정은 환경변수로 관리 (실값을 문서에 기록하지 않음)

### 10. 네트워크 관점에서 고려한 사항

* 브라우저 → Next.js(UI) → Express API → PostgreSQL 경로
* 로컬/배포 모두 Docker 네트워크로 서비스 분리
* Cloud에서는 HTTPS 종료 지점(리버스 프록시) 필요
* CORS는 Frontend Origin만 허용하도록 설계 예정
* DB 포트는 외부 공개하지 않고 내부 네트워크만 허용하는 방향

### 11. 설계를 설명할 때 점검할 질문

* 브라우저에서 API 요청이 발생하면 어떤 과정을 거치는가?
* 인증은 어디에서 처리하는가?
* 권한 검증은 어디에서 처리하는가?
* DB에는 어떤 데이터가 저장되는가?
* Frontend는 어떤 데이터를 상태로 관리하는가?
* Frontend에서 보안을 담당하면 안 되는 부분은 무엇인가?
* 왜 JWT를 Cookie가 아니라 Bearer로 보냈는가?
* 이메일 인증을 하지 않은 사용자가 로그인하면 어떻게 되는가?
* 다른 사용자의 게시글을 삭제 요청하면 서버는 무엇을 검사하는가?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 요청/응답의 계층별 책임 (UI / API Layer / Auth Middleware / Service / DB)
* Authentication vs Authorization 차이
* JWT 검증 위치와 소유권(IDOR) 검사 위치
* 비밀번호·인증 토큰·게시글/댓글의 저장 데이터 구분
* Frontend 상태의 역할(UX)과 서버 강제 검증의 역할(보안)
* CORS, HTTPS, Docker 내부망이 보안 경계에 미치는 영향

---

## STEP 04 - 프로젝트 기본 구조

> 사용자 요청 제목: `STEP 02 - 프로젝트 기본 구조`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 04로 기록한다.

### 1. 학습 질문

* 각 디렉터리의 책임은 무엇인가?
* Controller와 Service를 왜 분리하는가?
* Middleware의 역할은 무엇인가?
* 환경변수를 왜 사용하는가?
* CORS를 왜 Backend에서 설정하는가?

### 2. 학습한 이론

* Frontend와 Backend를 분리하면 배포·확장·보안 경계를 명확히 할 수 있다.
* Controller는 HTTP 입출력을, Service는 비즈니스 규칙을, Repository는 DB 접근을 담당한다.
* Middleware는 라우트 핸들러 전후에 공통 관심사(CORS, 에러, 추후 인증)를 처리한다.
* 환경변수는 환경별 설정과 비밀정보를 코드와 분리한다.
* CORS는 브라우저 보안 정책이며, 허용 Origin은 API 서버가 응답 헤더로 결정한다.

### 3. 설계 판단

* 디렉터리: `/frontend`, `/backend`, `/docker`, `/docs`
* Frontend: Next.js + TypeScript (App Router)
* Backend: Express + TypeScript, 계층 `routes / controllers / services / repositories / middleware / config / utils`
* 환경변수: `backend/.env`, `backend/.env.example`, `frontend/.env.example`
* PostgreSQL: `docker/docker-compose.yml` + `pg` Pool (`DATABASE_URL`)
* Health API: `GET /api/health` (서버 + DB ping, DB down 시 degraded/503)
* 에러: `AppError` + 공통 `errorHandler` / `notFoundHandler`
* CORS: Backend에서 `FRONTEND_ORIGIN`만 허용

### 4. 설계 이유

* 비즈니스 기능 없이 골격만 만들어, 이후 회원가입/게시글 기능을 같은 계층에 추가하기 위함
* Health에 DB 상태를 넣은 이유: 연결 설정이 실제로 동작하는지 초기에 검증 가능
* 선택하지 않은 대안:
  * Backend를 Next.js Route Handler에 합치기 — 아키텍처에서 Express 분리로 이미 결정
  * ORM 즉시 도입 — 이번 범위는 연결 설정까지, 선택 기능 확대 방지

#### 설계 변경

* 기존 설계: 문서상 디렉터리/계층만 존재, 코드 없음
* 변경 이유: STEP 02(사용자 표기)에서 실행 가능한 기본 구조 필요
* 새로운 설계: FE/BE 분리 스캐폴드 + health/CORS/error/env/db pool 구현

### 5. Cursor에게 전달한 명령

```text
# STEP 02 - 프로젝트 기본 구조

앞서 설계한 아키텍처를 기준으로 프로젝트 기본 구조를 만들어줘.

Frontend와 Backend를 명확하게 분리한다.

예상 구조:

/frontend
/backend
/docker
/docs

Frontend:

* Next.js
* TypeScript

Backend:

* Node.js
* Express
* TypeScript

Backend는 다음 계층을 고려한다.

* routes
* controllers
* services
* middleware
* repositories 또는 database layer
* config
* utils

아직 실제 비즈니스 기능은 구현하지 않는다.

다음만 구현한다.

1. Frontend 기본 실행
2. Backend 기본 Express 서버
3. 환경변수 구조
4. PostgreSQL 연결을 위한 기본 설정
5. Backend health check API
6. 기본 에러 처리 구조
7. 기본 CORS 구조

구현 후 다음을 설명해줘.

* 각 디렉터리의 책임
* Controller와 Service를 분리한 이유
* Middleware의 역할
* 환경변수를 사용하는 이유
* CORS를 Backend에서 설정하는 이유

그리고 현재 프로젝트가 정상적으로 실행되는지 검증해줘.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* 주요 생성/변경:
  * `frontend/` — Next.js + TypeScript 앱, 기본 홈 페이지
  * `backend/` — Express + TypeScript 계층 구조, health/CORS/error/env/db
  * `docker/docker-compose.yml` — PostgreSQL 16
  * `.gitignore`
  * `docs/ai-development-log.md` — STEP 04 기록
* Backend 핵심 경로:
  * `src/app.ts` — CORS, JSON, 라우터, 에러 미들웨어
  * `src/routes/health.routes.ts` → controller → service → repository
  * `GET /api/health`

#### Cursor가 임의로 추가한 부분 (검토 대상)

* `frontend/` 내부에서 create-next-app이 만든 nested `.git`을 제거했다.
* Health API가 DB down일 때 `503` + `status: degraded`를 반환하도록 했다.
* CORS에 `credentials: true`를 미리 켰다 (아직 쿠키 인증 미구현).
* 루트 `.gitignore`를 추가했다.

### 7. 테스트 및 검증 결과

* Backend typecheck: 성공 (`tsc --noEmit`)
* Backend 실행: `http://localhost:4000` listening 확인
* Frontend 실행: `http://localhost:3000` Ready, HTTP 200
* `GET /api/health` → `503` / `{"status":"degraded","database":"down",...}`  
  (Docker Desktop 미기동으로 PostgreSQL 연결 실패 — 서버 자체와 에러/CORS 헤더는 정상)
* `GET /api/unknown-path` → `404` / `{"error":{"code":"NOT_FOUND",...}}`
* CORS 헤더: `Access-Control-Allow-Origin: http://localhost:3000` 확인
* Docker Compose: Docker daemon 미실행으로 DB 기동 실패

### 8. 발견된 문제와 해결 방법

* 문제: Docker Desktop 엔진 미실행 → postgres 이미지 pull/기동 불가
* 해결/대응: Health를 degraded로 관찰해 서버 골격은 검증. DB up 검증은 Docker 실행 후 `docker compose -f docker/docker-compose.yml up -d` 필요
* 문제: PowerShell에서 `curl`이 `Invoke-WebRequest`로 별칭되어 옵션 실패
* 해결: `curl.exe`로 검증

### 9. 보안상 고려한 사항

* `.env`는 gitignore, 예시만 `.env.example`로 공유
* 기본 DB 비밀번호(`postgres`)는 로컬 개발용이며 운영에서 그대로 쓰면 안 됨
* CORS Origin을 `*`가 아니라 `FRONTEND_ORIGIN`으로 제한
* 아직 인증/인가 없음 — health는 공개 엔드포인트임을 인지

### 10. 네트워크 관점에서 고려한 사항

* FE `3000`, BE `4000`, DB `5432` 포트 분리
* 브라우저 → Backend 직접 호출 시 CORS가 필요 (다른 Origin)
* DB는 현재 호스트 포트 5432로 노출(로컬 개발). 배포 시에는 내부망만 허용하는 방향으로 갈 예정
* Health로 DB reachability를 네트워크/연결 설정 점검에 사용

### 11. 설계를 설명할 때 점검할 질문

* 각 디렉터리의 책임은?
* Controller와 Service를 분리한 이유는?
* Middleware는 무엇을 하나?
* 환경변수를 쓰는 이유는?
* CORS를 Backend에서 설정하는 이유는?
* Health가 503을 반환해도 서버가 정상인 경우가 있는가?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 계층형 아키텍처의 책임 분리
* 브라우저 Same-Origin Policy와 CORS 헤더의 의미
* 설정/비밀정보의 코드 분리
* liveness(서버 생존)와 readiness(DB 포함 의존성 준비) 개념
* Frontend는 UI, Backend는 데이터/규칙/보안 경계라는 점

---

## STEP 05 - Database 설계 및 구현

> 사용자 요청 제목: `STEP 03 - Database 설계 및 구현`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 05로 기록한다.

### 1. 학습 질문

* users : posts / users : comments / posts : comments 관계는 무엇인가?
* PK와 FK를 왜 사용하는가?
* email에 UNIQUE가 필요한 이유, NOT NULL이 필요한 컬럼, Index가 필요한 컬럼은?
* 게시글 삭제 시 댓글을 어떻게 처리하는가?
* 데이터 무결성을 어떻게 보장하는가?
* password가 아니라 password_hash만 저장하는 이유는?

### 2. 학습한 이론

* 관계형 DB에서 1:N은 FK로 표현한다.
* PK는 행 식별, FK는 참조 무결성(존재하지 않는 부모를 가리키지 못함)을 보장한다.
* UNIQUE는 중복 계정을 막고 로그인 조회 기준을 명확히 한다.
* NOT NULL은 필수 비즈니스 데이터가 비는 것을 DB 차원에서 막는다.
* Index는 자주 조회/조인하는 컬럼의 탐색 비용을 낮춘다.
* SQL Injection 방지를 위해 애플리케이션 쿼리는 파라미터 바인딩(`$1`)을 사용한다.
* 비밀번호 원문은 저장하지 않고 해시만 저장한다.

### 3. 설계 판단

* 테이블: `users`, `posts`, `comments`만 생성 (이번 단계 필수 범위)
* PK: 각 테이블 `id BIGSERIAL`
* FK:
  * `posts.user_id → users.id` (`ON DELETE RESTRICT`)
  * `comments.post_id → posts.id` (`ON DELETE CASCADE`)
  * `comments.user_id → users.id` (`ON DELETE RESTRICT`)
* `users.email UNIQUE NOT NULL`
* `password` 컬럼 없음, `password_hash`만 존재
* 마이그레이션: SQL 파일 + `schema_migrations` 추적 스크립트 (`npm run db:migrate`)
* 검증 스크립트: `npm run db:verify` (information_schema 조회, 파라미터 바인딩)

### 4. 설계 이유

* 게시글 삭제 시 고아 댓글을 남기지 않기 위해 `comments.post_id`는 CASCADE
* 사용자 삭제로 게시글/댓글이 조용히 연쇄 삭제되는 것을 막기 위해 user FK는 RESTRICT
* ORM 대신 SQL migration을 선택한 이유: 스키마를 직접 읽고 설명할 수 있어야 함
* 선택하지 않은 대안:
  * 댓글 soft delete / 게시글 삭제 시 댓글 유지 — 요구 범위·복잡도 증가
  * 사용자 삭제 CASCADE — 실수로 계정 삭제 시 콘텐츠 대량 삭제 위험

#### 설계 변경

* 기존 설계: PostgreSQL 연결 pool + health ping만 존재, 테이블 없음
* 변경 이유: 인증/게시글/댓글 기능을 위한 영속 모델 필요
* 새로운 설계: users/posts/comments + FK/UNIQUE/INDEX + SQL migration

### 5. Cursor에게 전달한 명령

```text
# STEP 03 - Database 설계 및 구현

이제 PostgreSQL 데이터베이스를 구현한다.

필수 테이블은 다음 세 개다.

users
posts
comments

users:

* id
* email
* password_hash
* email_verified
* created_at
* updated_at

posts:

* id
* user_id
* title
* content
* created_at
* updated_at

comments:

* id
* post_id
* user_id
* content
* created_at
* updated_at

먼저 구현하기 전에 다음 내용을 설명해줘.

1. users : posts 관계
2. users : comments 관계
3. posts : comments 관계
4. PK와 FK를 왜 사용하는가
5. email에 UNIQUE가 필요한 이유
6. NOT NULL이 필요한 컬럼
7. Index가 필요한 컬럼
8. 게시글 삭제 시 댓글을 어떻게 처리할지
9. 데이터 무결성을 어떻게 보장할지

그 후 DB schema/migration을 구현한다.

중요:

* password는 저장하지 않는다.
* password_hash만 저장한다.
* 외래키를 사용한다.
* 필요한 constraint를 설정한다.
* SQL Injection을 방지할 수 있는 DB 접근 방식을 사용한다.

구현 후 실제 생성된 schema를 검토하고,
설계와 코드가 일치하는지 검증해줘.


## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* 변경/생성 파일:
  * `backend/src/db/migrations/001_create_users_posts_comments.sql`
  * `backend/src/db/migrate.ts`
  * `backend/src/db/verifySchema.ts`
  * `backend/package.json` (`db:migrate`, `db:verify`)
  * `docs/ai-development-log.md` (STEP 05)

#### Cursor가 임의로 추가한 부분 (검토 대상)

* `schema_migrations` 테이블로 마이그레이션 이력을 추적했다.
* `ON DELETE` 정책을 CASCADE/RESTRICT로 구체화했다 (요구사항에 삭제 정책 상세는 질문으로만 존재).
* `title VARCHAR(200)`, `email VARCHAR(255)`, `TIMESTAMPTZ` 타입을 선택했다.
* 라이브 DB 검증용 `db:verify` 스크립트를 추가했다.

### 7. 테스트 및 검증 결과

* SQL 파일 ↔ 요구 컬럼 정적 대조: 일치 (`password` 컬럼 없음, FK/UNIQUE 포함)
* Docker Desktop: 기동 실패/엔진 미연결
* `npm run db:migrate`: 실패  
  * 원인: 호스트 `5432`에 다른 PostgreSQL이 응답했으나 `postgres/postgres` 인증 실패 (`28P01`)
  * 따라서 information_schema 기반 라이브 schema 검토는 이번 환경에서 완료하지 못함
* SQL Injection 대응: migrate/verify의 동적 값은 `$1` 파라미터 바인딩 사용

### 8. 발견된 문제와 해결 방법

* 문제: Docker Compose DB를 쓰지 못하는 상태에서, 로컬 PostgreSQL 비밀번호가 `.env`와 불일치
* 해결 방향(아직 미적용):
  1. Docker Desktop 실행 후 `docker compose -f docker/docker-compose.yml up -d`
  2. 또는 `backend/.env`의 `DATABASE_URL`을 실제 로컬 DB 계정에 맞게 수정
  3. 이후 `npm run db:migrate` → `npm run db:verify`

### 9. 보안상 고려한 사항

* `password` 컬럼을 만들지 않고 `password_hash`만 정의
* 앱/검증 스크립트에서 문자열 결합 SQL 대신 파라미터 바인딩
* DB 비밀번호를 로그/문서에 실값으로 남기지 않음
* UNIQUE/FK/NOT NULL로 잘못된 데이터 유입을 DB에서 차단

### 10. 네트워크 관점에서 고려한 사항

* Backend → PostgreSQL(`DATABASE_URL`) 연결이 전제
* 현재는 호스트 `localhost:5432` 접근; Docker 사용 시 컨테이너 포트 매핑과 인증 정보가 일치해야 함
* DB를 외부에 넓게 노출하지 않는 것이 운영 원칙 (로컬 개발 포트 오픈과 구분)

### 11. 설계를 설명할 때 점검할 질문

* users/posts/comments 관계는?
* 왜 FK를 쓰는가? CASCADE와 RESTRICT 차이는?
* 왜 email UNIQUE인가?
* 왜 password를 저장하지 않는가?
* SQL Injection을 어떻게 막는가?
* 게시글 삭제 시 댓글은 어떻게 되는가?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 1:N 관계와 참조 무결성
* PK/FK/UNIQUE/NOT NULL/INDEX의 역할
* ON DELETE CASCADE vs RESTRICT 선택 이유
* 해시 저장과 평문 저장의 차이
* 파라미터 바인딩이 SQL Injection을 막는 원리

---

## STEP 06 - REST API Backend 기반 구현

> 사용자 요청 제목: `STEP 04 - REST API Backend 기반 구현`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 06으로 기록한다.

### 1. 학습 질문

* HTTP Request / Response 구조는 무엇인가?
* Header / Body / Query / Path Parameter 차이는?
* Middleware 실행 순서는?
* Controller와 Service의 역할은?
* 401과 403, 400과 422의 차이는?
* 200/201/400/401/403/404/409/500을 어떻게 구분해서 쓰는가?

### 2. 학습한 이론

* REST API는 자원(Resource)과 HTTP 메서드·상태코드로 의도를 표현한다.
* Middleware는 요청 파이프라인의 공통 처리 단계이며 순서가 동작을 결정한다.
* Controller는 HTTP 입출력, Service는 비즈니스 규칙, Repository는 DB 접근을 담당한다.
* 401은 인증 실패/부재, 403은 인증은 되었으나 권한 없음이다.
* 400은 잘못된 요청 전반, 422는 문법은 맞지만 의미상 처리 불가인 경우에 쓰는 관례가 있다 (이번 프로젝트는 validation을 400으로 통일).

### 3. 설계 판단

* 요청 흐름: Request → Middleware → Route → Controller → Service → Repository → Response
* 성공 응답: `{ data: ... }` (`sendOk` / `sendCreated`)
* 실패 응답: `{ error: { code, message, details? } }`
* HTTP status 상수 + `AppError` 팩토리 (400/401/403/404/409/500)
* `validateRequest` 미들웨어 + `validators` 헬퍼로 validation 구조 준비
* CORS / JSON parser / 전역 error middleware / health check 유지·정리
* 잘못된 JSON body → `400 INVALID_JSON`
* 인증·회원가입·게시판은 구현하지 않음

### 4. 설계 이유

* 상태코드와 에러 형식을 먼저 고정해야 이후 auth/CRUD에서 응답이 흔들리지 않는다.
* validation 라이브러리(Zod 등)를 당장 강제하지 않고, 함수형 validator 구조를 두어 필수 범위만 유지.
* 422 미채택: 요구 status 목록에 없고, 학습 초기에는 400으로 validation을 단순화.

#### 설계 변경

* 기존 설계: health가 raw JSON을 그대로 반환, AppError는 단순 생성자만 존재
* 변경 이유: REST 기반 계층·상태코드·validation 구조를 명시적으로 만들기 위함
* 새로운 설계: `{ data }` / `{ error }` 계약 + HttpStatus + AppError factories + validateRequest

### 5. Cursor에게 전달한 명령

```text
# STEP 04 - REST API Backend 기반 구현

이제 REST API 서버의 기본 구조를 구현한다.

아직 회원가입이나 게시판 기능은 구현하지 않는다.

먼저 API 계층을 다음 구조로 구성한다.

Request
→ Middleware
→ Route
→ Controller
→ Service
→ Repository/DB
→ Response

다음 내용을 구현한다.

1. REST API routing
2. JSON request/response
3. HTTP status code 처리
4. 전역 error middleware
5. request validation 구조
6. CORS
7. health check

그리고 다음 HTTP status code를 명확히 구분해서 사용할 수 있도록 구조를 만든다.

200
201
400
401
403
404
409
500

구현 후 다음을 설명해줘.

* HTTP Request 구조
* HTTP Response 구조
* Header / Body / Query Parameter / Path Parameter
* Middleware 실행 순서
* Controller와 Service의 역할
* 401과 403의 차이
* 400과 422를 사용할 경우의 차이

아직 인증 기능은 구현하지 않는다.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* 주요 파일:
  * `backend/src/constants/httpStatus.ts` (신규)
  * `backend/src/utils/AppError.ts` (팩토리 확장)
  * `backend/src/utils/response.ts` (신규)
  * `backend/src/utils/validators.ts` (신규)
  * `backend/src/middleware/validateRequest.ts` (신규)
  * `backend/src/middleware/errorHandler.ts` / `notFoundHandler.ts` 개선
  * `backend/src/app.ts` / health controller·routes 정리
  * `docs/ai-development-log.md` STEP 06 기록

#### Cursor가 임의로 추가한 부분 (검토 대상)


* 성공 응답 envelope를 `{ data }`로 통일
* health DB down 시 `503` 유지 (요구 status 목록 밖)
* JSON parse 실패를 `400 INVALID_JSON`으로 매핑
* Zod 없이 수동 validator 헬퍼 도입

### 7. 테스트 및 검증 결과

* `npm run typecheck` 성공
* `GET /api/health` → `200` + `{"data":{"status":"ok","database":"up",...}}`
* `GET /api/nope` → `404` + `{"error":{"code":"NOT_FOUND",...}}`
* 잘못된 JSON body → `400` + `INVALID_JSON`
* 인증/회원가입/게시판 API: 의도적으로 미구현

### 8. 발견된 문제와 해결 방법

* 문제: 잘못된 JSON이 500으로 떨어짐
* 해결: errorHandler에서 body-parser SyntaxError(status 400)를 `INVALID_JSON`으로 처리

### 9. 보안상 고려한 사항

* 아직 인증 미구현 — 401/403 팩토리만 준비
* CORS Origin 제한 유지
* 에러 응답에 스택트레이스를 클라이언트로 노출하지 않음
* validation/details는 필드 수준의 정보만 담도록 구조화 (민감값 금지 원칙)

### 10. 네트워크 관점에서 고려한 사항

* Browser(Frontend Origin) → Backend `/api` JSON over HTTP
* CORS preflight/실요청 모두 Backend 헤더로 제어
* health로 DB 네트워크 연결 상태를 계속 확인 가능 (`database: up`)

### 11. 설계를 설명할 때 점검할 질문

* Request/Response / Header/Body/Query/Path 차이는?
* Middleware 순서는? 순서가 바뀌면 어떻게 되나?
* Controller vs Service?
* 401 vs 403, 400 vs 422?
* 왜 성공 응답을 `{ data }`로 감싸나?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* HTTP 메시지의 구성 요소
* Express 미들웨어 파이프라인
* 계층형 아키텍처 책임 분리
* 상태코드 의미와 인증/인가 구분
* 클라이언트 계약(API response shape)의 일관성

---

## STEP 07 - 회원가입

> 사용자 요청 제목: `STEP 05 - 회원가입`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 07으로 기록한다.

### 1. 학습 질문

* Hashing과 Encryption의 차이는?
* bcrypt가 필요한 이유, salt의 역할은?
* 비밀번호를 복호화할 필요가 없는 이유는?
* password와 password_hash를 분리하는 이유는?
* email UNIQUE와 애플리케이션 중복검사의 차이는?
* 입력값 validation이 필요한 이유는?
* 평문 비밀번호가 로그/에러 응답에 노출되지 않는가?

### 2. 학습한 이론

* Encryption은 키로 복호화 가능한 양방향, Hashing은 일방향(복호화 불가).
* 비밀번호는 원문 복원이 목적이 아니라, 로그인 시 같은 입력의 해시 비교가 목적이다.
* bcrypt는 느린 해시 + salt로 레인보우 테이블·동일 비번 동일 해시 문제를 완화한다.
* DB UNIQUE는 최종 무결성, 앱 중복검사는 UX/명확한 409 응답을 위한 선행 검사이다.
* Validation은 잘못된 입력을 비즈니스/DB 전에 차단한다.

### 3. 설계 판단

* API: `POST /api/auth/register` (기존 `/api` prefix 유지)
* 흐름: validateRequest → Controller → AuthService → bcrypt.hash → UserRepository → PostgreSQL
* 저장: `password_hash`만, `email_verified=false`
* 성공: `201` + `{ data: { user: { id, email, emailVerified, createdAt } } }`
* 에러:
  * 잘못된 email / 짧은 password / 잘못된 body → `400 VALIDATION_ERROR`
  * 이메일 중복 → `409 EMAIL_ALREADY_EXISTS` (앱 검사 + DB UNIQUE 23505)
* password 최소 길이 8, bcrypt saltRounds 10
* 로그인/이메일 발송/JWT는 이번 단계 범위 밖

### 4. 설계 이유

* 응답에 hash를 넣지 않아 탈취 면을 줄임
* UNIQUE + 앱 검사로 race와 명확한 에러 메시지를 함께 확보
* 이메일 인증 메일 발송은 다음 단계로 분리 (이번엔 상태 필드만 false로 관리)

#### 설계 변경

* 기존 설계: users 테이블만 존재, auth API 없음
* 변경 이유: 회원가입 필수 기능 구현
* 새로운 설계: auth register 계층 + bcrypt 해싱 + public user 응답

### 5. Cursor에게 전달한 명령

```text
# STEP 05 - 회원가입

이번 단계에서는 회원가입 기능만 구현한다.

API:

POST /auth/register

요구사항:

1. email validation
2. email 중복 검사
3. password validation
4. bcrypt password hashing
5. email verification 상태 관리
6. users 저장
7. 평문 비밀번호는 절대 저장하지 않음

먼저 구현 전에 다음을 설명해줘.

* Hashing과 Encryption의 차이
* bcrypt가 필요한 이유
* bcrypt salt의 역할
* 비밀번호를 복호화할 필요가 없는 이유
* password와 password_hash를 분리하는 이유
* email UNIQUE constraint와 애플리케이션 중복검사의 차이
* 입력값 validation이 필요한 이유

그 다음 구현한다.

에러 상황:

* 잘못된 이메일
* 너무 짧은 비밀번호
* 이미 존재하는 이메일
* 잘못된 request body

각 상황에 적절한 HTTP status code를 반환한다.

구현 후 회원가입 요청의 전체 흐름을 설명해줘.

Browser
→ HTTP Request
→ Express
→ Controller
→ Service
→ bcrypt
→ PostgreSQL
→ Response

각 단계에서 어떤 데이터가 이동하는지도 설명해줘.

마지막으로 password가 로그나 error response에 노출되지 않는지 검토해줘.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* 의존성: `bcrypt`, `@types/bcrypt`
* 신규/변경:
  * `src/routes/auth.routes.ts`
  * `src/controllers/auth.controller.ts`
  * `src/services/auth.service.ts`
  * `src/repositories/user.repository.ts`
  * `src/validators/auth.validators.ts`
  * `src/types/user.ts`
  * `src/routes/index.ts` (`/auth` 연결)
  * `docs/ai-development-log.md`

#### Cursor가 임의로 추가한 부분 (검토 대상)

* 실제 경로는 기존 규칙에 맞춰 `POST /api/auth/register` (요청 문구의 `/auth/register`에 `/api` prefix)
* password 최소 길이 8, 최대 72 (bcrypt 한계)
* email을 lower-case로 정규화
* DB UNIQUE 위반(23505)도 409로 매핑
* 응답 user에서 `password_hash` 제외 (`toPublicUser`)

### 7. 테스트 및 검증 결과

* typecheck 성공
* 정상 가입 → `201`, `emailVerified: false`, 응답에 password/hash 없음
* DB 확인: `password_hash`가 `$2b$10$...` 형태, 평문 없음
* 잘못된 email → `400`
* 짧은 password → `400`
* 중복 email → `409`
* 잘못된 body(`[]`) → `400`

### 8. 발견된 문제와 해결 방법

* PowerShell에서 curl JSON body 전달이 깨질 수 있음 → `Invoke-RestMethod`/`ConvertTo-Json`으로 검증
* 특이 버그 수정 없음

### 9. 보안상 고려한 사항

* 평문 password DB 미저장
* 응답/에러 details에 password 값 미포함 (field 이름만)
* `console.log`로 request body를 찍지 않음
* 전역 errorHandler는 예상치 못한 에러만 `console.error(err)` — AppError 경로의 validation 메시지는 password 원문 미포함
* 로그인 전 단계이므로 JWT 미발급

### 10. 네트워크 관점에서 고려한 사항

* Browser → `POST /api/auth/register` JSON → Express → PostgreSQL
* CORS는 Frontend Origin만 허용
* 비밀번호가 네트워크로 평문 전송되므로 이후 배포에서는 HTTPS 필수

### 11. 설계를 설명할 때 점검할 질문

* Hashing vs Encryption?
* 왜 bcrypt / salt?
* 왜 비밀번호를 복호화하지 않나?
* UNIQUE와 앱 중복검사 둘 다 하는 이유는?
* password가 응답/로그에 안 나가나?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 일방향 해시와 인증 비교 방식
* salt / cost factor 개념
* 앱 검증 + DB 제약의 역할 분담
* 민감정보(비밀번호)의 저장·전송·로깅 경계

---

## STEP 08 - 이메일 인증

> 사용자 요청 제목: `STEP 06 - 이메일 인증`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 08으로 기록한다.

### 1. 학습 질문

* 이메일 인증이 왜 필요한가?
* 인증 토큰은 어떻게 생성·저장·만료·재사용 방지하는가?
* 토큰 원문을 DB에 저장하는 것과 해시를 저장하는 것의 보안 차이는?
* 이미 인증된 계정 / 만료 / 잘못된 토큰은 어떻게 처리하는가?
* 실제 메일 서비스 없이 개발 환경에서 흐름을 어떻게 확인하는가?

### 2. 학습한 이론

* 이메일 인증은 계정이 해당 메일함 통제권을 가진 사용자인지 확인해, 가짜/오타 이메일·스팸 가입을 줄인다.
* 인증 토큰은 추측 불가능한 랜덤 값이어야 하며, 짧은 수명과 1회용(used) 처리가 필요하다.
* DB에 원문을 두면 유출 시 즉시 인증 링크 도용이 가능하다. 해시만 저장하면 유출만으로 원문 토큰을 바로 알 수 없다.
* 비밀번호와 달리 고엔트로피 토큰은 SHA-256 해시로 저장하는 것이 일반적이다 (bcrypt까지 쓸 필요는 보통 없음).

### 3. 설계 판단

* 테이블: `email_verification_tokens` (`token_hash`, `expires_at`, `used_at`)
* 토큰: `crypto.randomBytes(32)` → base64url 원문 / DB에는 SHA-256 hex
* 만료: `EMAIL_VERIFICATION_EXPIRES_HOURS` (기본 24)
* 회원가입 시 토큰 발급 + 기존 미사용 토큰 무효화
* 메일: `ConsoleEmailSender` (콘솔 출력, SMTP 없음)
* 개발 편의: `NODE_ENV=development`일 때만 응답에 `devVerificationToken` 포함
* API: `POST /api/auth/verify-email` `{ token }`
* 상태:
  * invalid → 400 `TOKEN_INVALID`
  * used → 400 `TOKEN_ALREADY_USED`
  * expired → 400 `TOKEN_EXPIRED`
  * 이미 verified → 200 + `alreadyVerified: true` (토큰은 used 처리)
  * 성공 → 200 + `emailVerified: true`

### 4. 설계 이유

* 해시 저장을 선택: DB 유출 시 인증 링크 즉시 악용 위험 감소
* Console mailer: 필수 요구 “과도한 이메일 서비스 구현 금지” 충족
* 재사용 방지: `used_at`으로 1회용 강제
* 선택하지 않은 대안: 토큰 원문 DB 저장, 사용자 테이블에 토큰 컬럼만 두기 (이력·다회 발급 관리가 불리)

#### 설계 변경

* 기존 설계: `users.email_verified`만 존재, 인증 토큰/검증 API 없음
* 변경 이유: 회원가입 후 이메일 소유 확인 흐름 필요
* 새로운 설계: 토큰 테이블 + verify-email API + 개발용 콘솔 메일

### 5. Cursor에게 전달한 명령

```text
# STEP 06 - 이메일 인증

회원가입 후 이메일 인증 기능을 구현한다.

먼저 이메일 인증이 필요한 이유를 설명해줘.

그리고 인증 토큰 설계를 제안해줘.

다음 사항을 고려한다.

* 인증 토큰 생성
* 만료 시간
* 인증 토큰 저장 방식
* 인증 완료 처리
* 이미 인증된 계정 처리
* 만료된 토큰 처리
* 잘못된 토큰 처리
* 토큰 재사용 방지

보안 관점에서 인증 토큰 원문을 DB에 저장하는 방식과
Hash를 저장하는 방식의 차이를 설명해줘.

그 후 구현한다.

실제 이메일 발송 서비스 자체는 과도하게 구현하지 말고,
개발 환경에서 인증 흐름을 확인할 수 있는 구조로 구현한다.

구현 후 보안 취약점이 있는지 검토해줘.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `002_email_verification_tokens.sql` migration 적용
* `utils/token.ts`, `emailVerification.repository.ts`, `emailSender.ts`
* `auth.service` register에 토큰 발급/메일(콘솔) 연동, `verifyEmail` 추가
* `POST /api/auth/verify-email`
* env: `EMAIL_VERIFICATION_EXPIRES_HOURS`

#### Cursor가 임의로 추가한 부분 (검토 대상)

* development 응답의 `devVerificationToken`
* 프론트 링크 형태 `FRONTEND_ORIGIN/verify-email?token=...` (콘솔 출력용, FE 페이지는 미구현)
* 이미 인증된 경우 200 idempotent 처리
* SHA-256 해시 저장 (bcrypt 아님)

### 7. 테스트 및 검증 결과

* migrate `002` 적용 성공, typecheck 성공
* register → `devVerificationToken` 수신, `emailVerified: false`
* verify-email → `emailVerified: true`
* 동일 토큰 재사용 → 400
* 잘못된 토큰 → 400
* DB: `token_hash` 길이 64, `used_at` 설정 확인 (원문 토큰 컬럼 없음)

### 8. 발견된 문제와 해결 방법

* 특이 버그 없음
* 만료 토큰은 코드 경로로 구현했으나 시간 조작 E2E는 이번 검증에서 생략 (설계상 `TOKEN_EXPIRED`)

### 9. 보안상 고려한 사항

* DB에 토큰 원문 미저장 (hash only)
* 1회용 + 만료
* 신규 발급 시 기존 미사용 토큰 무효화
* 운영에서 `devVerificationToken`/콘솔 토큰 로그가 남지 않도록 `NODE_ENV` 분리 필요
* 토큰 전달 채널(메일/HTTPS) 보호가 전제 — 현재는 개발용 콘솔/응답

### 10. 네트워크 관점에서 고려한 사항

* 실제 서비스에서는 메일 링크 클릭 → Frontend → Backend verify API
* 지금은 개발자가 토큰을 API로 직접 POST 하여 동일 서버 로직을 검증
* 토큰이 URL query로 전달되면 로그/Referer 유출 위험이 있어, 최종 FE에서는 POST body 권장

### 11. 설계를 설명할 때 점검할 질문

* 왜 이메일 인증이 필요한가?
* 왜 토큰을 해시로 저장하는가?
* 재사용/만료를 어떻게 막는가?
* 비밀번호 해시(bcrypt)와 토큰 해시(SHA-256)를 다르게 쓰는 이유는?
* 개발용 토큰 노출은 운영에서 괜찮은가?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 이메일 소유권 증명의 목적
* 고엔트로피 시크릿의 해시 저장
* 만료·1회용·무효화로 공격 창을 줄이는 방법
* 개발 편의와 운영 보안 설정의 분리

---

## STEP 09 - JWT 로그인

> 사용자 요청 제목: `STEP 07 - JWT 로그인`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 09로 기록한다.

### 1. 학습 질문

* JWT란 무엇이며 Header/Payload/Signature/Secret/exp의 역할은?
* JWT가 암호화가 아닌 이유, 변조·탈취 시 동작/위험은?
* 로그인 성공 정보를 왜 HttpOnly Cookie로 전달하는가?
* Set-Cookie는 무엇을 하는가?
* email_verified / bcrypt.compare / JWT 발급 순서는?

### 2. 학습한 이론

* JWT는 서명된 클레임(claim) 전달 형식이다. Payload는 Base64로 보여도 되고, 무결성은 Signature가 보장한다.
* Secret으로 Signature를 검증하면 변조를 탐지한다. Secret이 없으면 위조 JWT를 만들 수 있다.
* JWT 탈취 시 만료 전까지 해당 사용자로 위장 요청이 가능하다.
* HttpOnly Cookie는 JS(document.cookie)로 토큰을 읽지 못하게 해 XSS로 인한 토큰 탈취면을 줄인다. CSRF는 별도 고려가 필요하다.

### 3. 설계 판단

* API: `POST /api/auth/login`
* 흐름: validation → 사용자 조회 → email_verified → bcrypt.compare → JWT 서명 → `Set-Cookie: access_token`
* Payload: `{ userId, iat, exp }` (password/hash/개인정보/secret 미포함)
* Cookie: `HttpOnly`, `SameSite=Lax`, `Secure`는 production만, `Path=/`, `Max-Age`=JWT 만료
* Secret/만료: `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS` 환경변수
* 실패: 잘못된 자격증명 `401`, 미인증 이메일 `403`
* 응답 body에는 JWT 원문을 넣지 않고 user 공개 정보만 반환

### 4. 설계 이유

* Cookie+HttpOnly는 XSS 대비에 유리하고, 이번 요구사항이 Cookie 방향을 명시함
* 자격증명 실패 메시지를 통일해 이메일 존재 여부 노출을 줄임
* 미인증 이메일은 403으로 인증(자격)과 구분

#### 설계 변경

* 기존 설계(아키텍처 단계 추천): Access Token을 **메모리 + Authorization Bearer**로 전달
* 변경 이유: STEP 07에서 **HttpOnly Cookie** 저장/전달을 명시적으로 요구
* 새로운 설계: 로그인 성공 시 `Set-Cookie`로 `access_token` 전달 (body에 토큰 미포함)

### 5. Cursor에게 전달한 명령

```text
# STEP 07 - JWT 로그인

이번 단계에서 로그인과 JWT 인증을 구현한다.

API:

POST /auth/login

로그인 흐름:

1. email/password 수신
2. 사용자 조회
3. email_verified 확인
4. bcrypt.compare
5. 인증 성공
6. JWT 생성
7. 인증 정보 전달

JWT payload는 최소한의 정보만 포함한다.

예:

* userId
* exp

JWT에 다음 정보를 넣지 않는다.

* password
* password_hash
* 불필요한 개인정보
* secret 정보

JWT secret은 환경변수로 관리한다.

구현 전에 다음을 설명해줘.

1. JWT란 무엇인가?
2. JWT Header
3. JWT Payload
4. JWT Signature
5. JWT Secret
6. exp
7. JWT가 암호화가 아닌 이유
8. JWT가 변조되었을 때 어떻게 검증되는지
9. JWT가 탈취되면 어떤 문제가 발생하는지

그 후 구현한다.

로그인 성공 시 인증 정보를 HttpOnly Cookie에 저장하는 방향을 사용한다.

구현 후 실제 HTTP Request / Response를 기준으로 로그인 과정을 설명해줘.

특히 Set-Cookie가 어떤 역할을 하는지 설명한다.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* 의존성: `jsonwebtoken`
* 신규/변경: `utils/jwt.ts`, `config/authCookie.ts`, `env` JWT 설정, auth login service/controller/route/validator
* API: `POST /api/auth/login`

#### Cursor가 임의로 추가한 부분 (검토 대상)

* 쿠키 이름 `access_token`
* `SameSite=Lax`, production에서만 `Secure`
* 응답 body에 accessToken을 넣지 않음
* `verifyAccessToken` 유틸 선구현 (보호 API 미들웨어는 아직 미연결)
* jsonwebtoken이 payload에 `iat`를 자동 추가

### 7. 테스트 및 검증 결과

* typecheck 성공
* 인증된 사용자 로그인 → `200`, `Set-Cookie: access_token=...; HttpOnly; SameSite=Lax`, body에 user만
* 잘못된 비밀번호 → `401`
* 미인증 이메일 로그인 → `403`
* JWT payload 확인: `userId`, `iat`, `exp` (password 없음)

### 8. 발견된 문제와 해결 방법

* 특이 버그 없음
* 보호 라우트용 auth middleware는 이번 범위에 없어 다음 단계에서 쿠키 파싱/검증 연결 필요

### 9. 보안상 고려한 사항

* JWT에 민감정보 미포함
* Secret 환경변수화 (개발용 기본 secret은 운영 사용 금지)
* HttpOnly로 JS 접근 차단
* Cookie 기반이므로 CSRF 위험 존재 → 이후 SameSite/CSRF 토큰 전략 검토 필요
* XSS로 document.cookie는 못 읽어도, 브라우저가 자동 첨부하는 요청은 악성 스크립트가 유발할 수 있음

### 10. 네트워크 관점에서 고려한 사항

* Request: JSON body(email/password) + CORS credentials
* Response: `Set-Cookie`로 브라우저에 토큰 저장 지시
* 이후 요청에서 브라우저가 동일 사이트 조건에 맞으면 `Cookie` 헤더로 자동 전송
* 배포 시 HTTPS + Secure 쿠키 필요

### 11. 설계를 설명할 때 점검할 질문

* JWT 구조와 서명의 의미는?
* 왜 암호화가 아닌가?
* 탈취되면?
* Set-Cookie / HttpOnly 역할은?
* Bearer 방식에서 Cookie로 바꾼 이유는?
* 401과 403을 로그인에서 어떻게 나눴나?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* JWT의 서명 검증과 만료
* Cookie 속성(HttpOnly/Secure/SameSite)과 XSS·CSRF 관계
* 인증 성공 후 클라이언트에 자격증명을 심는 HTTP 메커니즘

---

## STEP 10 - JWT Cookie 보안 설정

> 사용자 요청 제목: `STEP 08 - JWT Cookie 보안 설정`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 10으로 기록한다.

### 1. 학습 질문

* HttpOnly / Secure / SameSite / Max-Age / Path는 각각 왜 필요한가?
* HttpOnly와 XSS, Secure와 HTTPS, SameSite와 CSRF 관계는?
* Cookie 기반 인증의 장단점과 localStorage JWT 비교는?
* 개발/운영에서 Cookie 설정이 어떻게 달라져야 하는가?
* JS가 JWT를 직접 읽을 수 없는가?

### 2. 학습한 이론

* HttpOnly: `document.cookie` 접근 차단 → XSS로 토큰을 스크립트가 읽기 어렵게 함
* Secure: HTTPS에서만 쿠키 전송 → 평문 HTTP 중간자 탈취 완화
* SameSite: cross-site 요청에 쿠키 전송을 제한 → CSRF 완화 (완전 방어는 아님)
* Max-Age/Expires: 쿠키 수명. Path: 어떤 URL 경로에 쿠키를 붙일지
* localStorage JWT는 JS가 항상 읽을 수 있어 XSS에 취약
* Cookie JWT는 CSRF 표면이 생김

### 3. 설계 판단

* HttpOnly: **항상 true**
* Path: `/`
* Max-Age: `JWT_EXPIRES_IN_SECONDS`와 동기화
* Secure: development 기본 false / production 기본 true (`COOKIE_SECURE`로 재정의 가능)
* SameSite: 기본 `lax` (`COOKIE_SAMESITE=lax|strict|none`)
* `SameSite=none`이면 `Secure=true` 강제 검증
* 응답 body에 JWT 미포함
* `docs/security.md`에 Cookie 결정을 반영

### 4. 설계 이유

* 로컬 HTTP에서는 Secure=true면 쿠키가 저장/전송되지 않아 개발이 막힘 → dev/prod 분리
* SameSite=Lax는 일반 폼 CSRF를 상당 부분 완화하면서 same-site SPA 사용이 가능
* localStorage 대비 XSS 토큰 탈취면을 줄이는 것이 Cookie 선택의 핵심 이유

#### 설계 변경

* 기존 설계: Cookie 옵션이 코드에 `secure: !isDevelopment`, `sameSite: "lax"`로 고정
* 변경 이유: 개발/운영 차이를 환경변수로 명시하고, None+Secure 조합을 안전하게 강제
* 새로운 설계: `COOKIE_SECURE`, `COOKIE_SAMESITE` + 설정 검증/요약 함수

### 5. Cursor에게 전달한 명령

```text
# STEP 08 - JWT Cookie 보안 설정

JWT를 HttpOnly Cookie로 관리하는 구조를 검토하고 보안 설정을 구현한다.

Cookie에 다음 속성을 검토한다.

* HttpOnly
* Secure
* SameSite
* Max-Age 또는 Expires
* Path

각 속성이 왜 필요한지 먼저 설명해줘.

특히:

1. HttpOnly와 XSS
2. Secure와 HTTPS
3. SameSite와 CSRF
4. Cookie 기반 인증의 장점
5. localStorage JWT 방식과 비교
6. Cookie 기반 JWT의 단점

을 설명한다.

개발 환경과 Production 환경에서 설정이 달라질 수 있는 부분을 명확하게 구분한다.

그 후 실제 Cookie 설정을 구현하고,
브라우저에서 JavaScript가 JWT를 직접 읽을 수 없는 구조인지 확인해줘.


## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `backend/src/config/authCookie.ts` — HttpOnly 강제, Secure/SameSite/Path/Max-Age, None+Secure 검증, 요약 함수
* `backend/src/config/env.ts` — `COOKIE_SECURE`, `COOKIE_SAMESITE`
* `.env` / `.env.example` 갱신
* `docs/security.md` — Cookie 결정 반영
* `docs/ai-development-log.md` — STEP 10

#### Cursor가 임의로 추가한 부분 (검토 대상)

* `getAccessTokenCookieSecuritySummary()` 헬퍼
* `docs/security.md` 전체 내용을 현재 결정에 맞게 갱신 (요청은 로그 업데이트 중심이었으나 보안 설계 문서 동기화)

### 7. 테스트 및 검증 결과

* typecheck 성공
* 로그인 Set-Cookie: `HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`
* development에서 `Secure` 없음 (의도)
* 응답 body에 JWT(`eyJ...`) 없음 → JS가 body로도 토큰을 얻지 못함
* HttpOnly 플래그 존재 → 브라우저 `document.cookie`로는 `access_token` 읽기 불가 (브라우저 표준 동작)

### 8. 발견된 문제와 해결 방법

* 특이 버그 없음
* CSRF 토큰은 아직 없음 → SameSite만으로는 완전하지 않음을 문서로 명시

### 9. 보안상 고려한 사항

* HttpOnly로 XSS 토큰 절취면 축소 (XSS 자체 제거는 별개)
* Secure는 운영 HTTPS 전제
* SameSite=Lax로 CSRF 완화, 추가 CSRF 방어는 후속
* Cookie 값은 로그/요약에 출력하지 않음

### 10. 네트워크 관점에서 고려한 사항

* HTTP(dev) vs HTTPS(prod)에 따라 Secure 쿠키 전송 가능 여부가 달라짐
* CORS credentials + Cookie 자동 첨부
* cross-site FE/API를 쓸 경우 SameSite=None+Secure+HTTPS 필요

### 11. 설계를 설명할 때 점검할 질문

* HttpOnly가 XSS를 완전히 막나?
* 왜 로컬에서 Secure=false인가?
* SameSite=Lax와 CSRF 관계는?
* localStorage와 Cookie 중 무엇을 고른 이유는?
* JS가 JWT를 못 읽는다는 것을 어떻게 증명하나?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* Cookie 보안 속성 각각의 공격 대응 범위
* XSS vs CSRF의 차이
* 개발/운영 네트워크(HTTP/HTTPS)와 Secure 쿠키
* “읽을 수 없음(HttpOnly)”과 “자동 전송됨(Cookie)”의 차이

---

## STEP 11 - Authentication Middleware

> 사용자 요청 제목: `STEP 09 - Authentication Middleware`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 11으로 기록한다.

### 1. 학습 질문

* Authentication과 Authorization의 차이는?
* Cookie의 JWT를 어떻게 추출·검증하는가?
* JWT 없음 / 변조 / 만료 / 없는 userId / 정상 각각 어떻게 처리하는가?
* 존재 여부만 보지 않고 signature·expiration을 검증해야 하는 이유는?

### 2. 학습한 이론

* Authentication: 누구인지 확인. Authorization: 무엇을 할 수 있는지 확인.
* JWT 검증은 `jwt.verify(secret)`로 서명과 만료를 함께 검사한다. 문자열 존재만으로는 위조 토큰을 막을 수 없다.
* 인증 미들웨어는 성공 시 request context(`req.user`)에 사용자 정보를 심어 Controller가 사용한다.

### 3. 설계 판단

* `cookie-parser`로 Cookie 파싱
* `requireAuth` 미들웨어: Cookie `access_token` → `verifyAccessToken` → DB user 조회 → `req.user`
* 실패는 모두 401 (코드로 구분: `UNAUTHORIZED` / `INVALID_TOKEN` / `TOKEN_EXPIRED` / `USER_NOT_FOUND`)
* 테스트 보호 API: `GET /api/auth/me`
* Authorization(소유권 등)은 아직 미구현 — Authentication만

### 4. 설계 이유

* 보호 API마다 검증 코드를 복제하지 않고 middleware로 공통화
* DB에서 user를 다시 조회해, 삭제된 계정의 유효 JWT를 거부
* 만료와 변조를 다른 error code로 남겨 디버깅/클라이언트 처리를 쉽게 함 (HTTP는 401 유지)

#### 설계 변경

* 기존 설계: 로그인으로 Cookie 발급만, 보호 라우트 없음
* 변경 이유: 인증이 필요한 API의 공통 진입점 필요
* 새로운 설계: `requireAuth` + `/api/auth/me` 검증용 엔드포인트

### 5. Cursor에게 전달한 명령

```text
# STEP 09 - Authentication Middleware

이제 인증 middleware를 구현한다.

인증이 필요한 API의 요청 흐름:

Request
→ Cookie
→ JWT 추출
→ JWT Signature 검증
→ JWT expiration 검증
→ userId 추출
→ authenticated user 설정
→ Controller

구현 요구사항:

* JWT가 없으면 401
* JWT가 invalid하면 401
* JWT가 expired면 401
* 정상 JWT면 인증된 user 정보를 request context에 전달

중요:

JWT가 존재하는지만 검사하지 않는다.

반드시 signature와 expiration을 검증한다.

그리고 Authentication과 Authorization의 차이를 설명해줘.

또한 다음 상황을 각각 어떻게 처리해야 하는지 설명한다.

* JWT 없음
* JWT 변조
* JWT 만료
* 존재하지 않는 userId
* 정상 JWT

구현 후 middleware를 사용하는 테스트 API를 하나 만들어 검증한다.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `cookie-parser` 추가, `app.ts`에 연결
* `middleware/requireAuth.ts`
* `utils/jwt.ts` — `TOKEN_EXPIRED` / `INVALID_TOKEN` 구분
* `GET /api/auth/me` (requireAuth)
* 학습 로그 STEP 11

#### Cursor가 임의로 추가한 부분 (검토 대상)

* 테스트 API 경로를 `/api/auth/me`로 선정
* 없는 userId에 `USER_NOT_FOUND` 코드 (여전히 401)
* error code를 세분화 (HTTP status는 401로 통일)

### 7. 테스트 및 검증 결과

* typecheck 성공
* Cookie 없음 → 401 `UNAUTHORIZED`
* 정상 Cookie → 200 + user
* 서명 변조 → 401 `INVALID_TOKEN`
* 만료 토큰 → 401 `TOKEN_EXPIRED`
* 없는 userId JWT → 401 `USER_NOT_FOUND`

### 8. 발견된 문제와 해결 방법

* PowerShell `Invoke-WebRequest -Headers Cookie`가 쿠키를 제대로 전달하지 못함
* 해결: `curl.exe -H "Cookie: access_token=..."`로 검증

### 9. 보안상 고려한 사항

* 존재 여부만 보지 않고 `jwt.verify`로 서명·만료 검증
* `req.user`에 password_hash 미포함
* Authorization(리소스 소유권)은 아직 별도 — 인증만으로 권한 부여하지 않음

### 10. 네트워크 관점에서 고려한 사항

* 브라우저가 Cookie를 자동 전송해야 보호 API 접근 가능 (credentials)
* curl 테스트에서는 Cookie 헤더를 수동 첨부

### 11. 설계를 설명할 때 점검할 질문

* Authentication vs Authorization?
* 왜 JWT 문자열 존재만으로 부족한가?
* 만료/변조/없는 유저를 어떻게 구분·처리하는가?
* `req.user`에는 무엇을 넣나?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 인증 미들웨어 파이프라인
* JWT verify의 의미 (서명 + exp)
* 401의 의미와 error code 세분화
* 이후 Authorization(소유권)과의 연결점

---

## STEP 12 - Authorization

> 사용자 요청 제목: `STEP 10 - Authorization`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 12로 기록한다.

### 1. 학습 질문

* Authentication / Authorization / IDOR / BOLA란?
* Client-side authorization이 왜 안전한가?
* 다른 사용자 postId로 수정/삭제 API를 호출하면 Backend가 무엇을 검사해야 하는가?
* `authenticatedUser.id` vs `resource.user_id` 비교는 어디에서 해야 하는가?

### 2. 학습한 이론

* Authentication: 신원 확인. Authorization: 해당 행동 허용 여부.
* IDOR/BOLA: 객체 ID만 바꿔 타인 리소스에 접근하는 취약점. 서버가 소유권을 검사하지 않을 때 발생.
* Frontend 숨김/비활성은 UX일 뿐, 공격자는 API를 직접 호출한다.

### 3. 설계 판단

* `assertResourceOwner(authenticatedUserId, resourceOwnerId)` → 불일치 시 `403 FORBIDDEN`
* 게시글 작성/댓글 작성: `requireAuth`만
* 게시글 수정·삭제 / 댓글 삭제: Service에서 리소스 조회 후 소유권 검사
* API:
  * `POST /api/posts`, `PATCH|DELETE /api/posts/:id`
  * `POST /api/posts/:postId/comments`, `DELETE /api/comments/:id`
* 목록 Pagination은 이번 단계 범위 밖(권한 구조 검증에 필요한 최소 CRUD)

### 4. 설계 이유

* 소유권 검사를 Service에 두어 Controller/Route마다 빠뜨리기 어렵게 함
* 401(미인증)과 403(권한 없음)을 분리
* 선택하지 않은 대안: Frontend만으로 버튼 숨기기 — 보안이 아님

#### 설계 변경

* 기존 설계: Authentication(`requireAuth`)만 존재
* 변경 이유: 리소스 단위 권한 규칙 필요
* 새로운 설계: `assertResourceOwner` + posts/comments 권한 적용 API

### 5. Cursor에게 전달한 명령

```text
# STEP 10 - Authorization

이제 인증된 사용자의 리소스 접근 권한을 구현한다.

이번 과제의 권한 규칙:

* 게시글 작성: 로그인 사용자
* 게시글 수정: 작성자 본인
* 게시글 삭제: 작성자 본인
* 댓글 작성: 로그인 사용자
* 댓글 삭제: 댓글 작성자 본인

중요:

Frontend에서 권한을 검사하는 것만으로 보안을 구현하지 않는다.

Backend에서 반드시 다음과 같이 검증한다.

authenticatedUser.id
vs
resource.user_id

그리고 다음 개념을 설명해줘.

* Authentication
* Authorization
* IDOR
* BOLA
* Client-side authorization이 안전하지 않은 이유

실제 다른 사용자의 postId를 직접 API에 넣어 수정/삭제하는 공격 시나리오를 기준으로 설명한다.

그 후 권한 검증 구조를 구현한다.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `utils/authorization.ts` (`assertResourceOwner`)
* posts/comments repository·service·controller·routes·validators
* `docs/security.md` 인가/IDOR 갱신
* 검증 스크립트 `src/scripts/testAuthorization.ts`

#### Cursor가 임의로 추가한 부분 (검토 대상)

* 권한 검증을 위해 게시글/댓글 최소 CRUD API를 함께 구현 (목록 Pagination/조회 목록은 최소화)
* `GET /api/posts/:id` 공개 조회 추가
* 테스트용 스크립트 추가

### 7. 테스트 및 검증 결과

* typecheck 성공
* A가 게시글 생성 → 201
* B가 A의 postId로 PATCH/DELETE → **403 FORBIDDEN**
* B가 A의 comment 삭제 → **403**
* A가 본인 comment 삭제 / post 수정 → **200**

### 8. 발견된 문제와 해결 방법

* PowerShell+curl JSON 이스케이프 문제로 초기 수동 테스트 실패
* Node fetch 스크립트로 IDOR 시나리오 재검증하여 해결

### 9. 보안상 고려한 사항

* 소유권은 Backend Service에서 강제
* 로그인만으로 타인 리소스 수정 불가 (IDOR 차단)
* 401 vs 403 구분
* Frontend 권한 UI는 보안 경계가 아님을 문서화

### 10. 네트워크 관점에서 고려한 사항

* 공격자는 브라우저 UI 없이 Cookie+API로 직접 요청 가능
* 따라서 네트워크로 도달하는 모든 보호 API가 서버 권한 검사를 거쳐야 함

### 11. 설계를 설명할 때 점검할 질문

* IDOR/BOLA란? 이 프로젝트에서 어떻게 막았나?
* 왜 Frontend 검사만으로는 부족한가?
* 401과 403 차이는?
* `assertResourceOwner`는 언제 호출되나?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* AuthN vs AuthZ
* 객체 수준 인가와 IDOR
* 서버 측 소유권 비교의 위치(Service)

---

## STEP 13 - 게시글 CRUD

> 사용자 요청 제목: `STEP 11 - 게시글 CRUD`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 13으로 기록한다.

### 1. 학습 질문

* 게시글 CRUD 각 메서드의 인증/인가/공개 범위는?
* PUT/DELETE에서 URL id만 믿으면 안 되는 이유는?
* 미로그인 POST, 타인 수정/삭제, 없는 id, 잘못된/만료 JWT, 잘못된 body는 각각 어떤 status인가?

### 2. 학습한 이론

* REST에서 자원은 `/posts`, `/posts/:id`로 표현하고 메서드로 행위를 구분한다.
* 인가가 필요한 변경 요청은 Authentication 후 Authorization(소유권)을 서버에서 수행한다.
* IDOR는 객체 id만 바꿔 호출하는 공격이며, DB의 `user_id` 비교로 차단한다.

### 3. 설계 판단

* `POST /api/posts` — requireAuth + validation → 201
* `GET /api/posts` — 공개 목록 → 200
* `GET /api/posts/:id` — 공개 상세 → 200 / 404
* `PUT /api/posts/:id` — requireAuth + owner → 200 / 403 / 404
* `DELETE /api/posts/:id` — requireAuth + owner → 200 / 403 / 404
* 수정 메서드를 PATCH → **PUT**으로 맞춤 (요구사항)

### 4. 설계 이유

* 목록 API가 없으면 클라이언트/검증이 불편해 GET /posts 추가
* PUT으로 전체 교체(title/content) 의미를 요구사항에 맞춤
* 소유권 검사는 Service의 `assertResourceOwner` 유지

#### 설계 변경

* 기존 설계: `PATCH /posts/:id`, 목록 API 없음
* 변경 이유: STEP 11이 PUT과 GET /posts를 명시
* 새로운 설계: `PUT /posts/:id` + `GET /posts` 목록

### 5. Cursor에게 전달한 명령

```text
# STEP 11 - 게시글 CRUD

게시글 CRUD를 구현한다.

API:

POST /posts
GET /posts
GET /posts/:id
PUT /posts/:id
DELETE /posts/:id

권한:

POST

* 로그인 필요

GET

* 공개

PUT

* 로그인 필요
* 작성자 본인만

DELETE

* 로그인 필요
* 작성자 본인만

각 API에 대해 다음을 구현한다.

* request validation
* authentication
* authorization
* DB query
* 적절한 status code
* error response

특히 PUT /posts/:id와 DELETE /posts/:id에서는
URL의 id만 신뢰하지 말고 인증된 userId와 DB의 user_id를 비교한다.

다음 공격 시나리오를 테스트한다.

1. 로그인하지 않고 POST
2. 다른 사용자의 POST 수정
3. 다른 사용자의 POST 삭제
4. 존재하지 않는 postId
5. 잘못된 JWT
6. 만료된 JWT
7. 잘못된 request body

구현 후 각 API의 HTTP Request / Response 예시를 보여줘.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `GET /api/posts` 목록 추가
* `PUT /api/posts/:id`로 변경 (PATCH 제거)
* repository `findMany`, service `list`, controller `list`
* 검증 스크립트 `src/scripts/testPostCrud.ts`

#### Cursor가 임의로 추가한 부분 (검토 대상)

* 목록은 Pagination 없이 전체 `ORDER BY created_at DESC` (Pagination은 별도 단계 가능)
* 테스트 스크립트 추가

### 7. 테스트 및 검증 결과

* typecheck 성공
* 1 미로그인 POST → 401
* 2 타인 PUT → 403
* 3 타인 DELETE → 403
* 4 없는 id → 404
* 5 잘못된 JWT → 401 `INVALID_TOKEN`
* 6 만료 JWT → 401 `TOKEN_EXPIRED`
* 7 잘못된 body → 400
* 본인 PUT/DELETE → 200
* LIST/DETAIL → 200

### 8. 발견된 문제와 해결 방법

* 특이 버그 없음
* PATCH→PUT 변경으로 기존 인가 테스트 스크립트도 PUT으로 갱신

### 9. 보안상 고려한 사항

* PUT/DELETE에서 URL id만 쓰지 않고 DB `user_id`와 비교
* GET은 공개, 변경은 인증+인가
* 파라미터 바인딩 SQL

### 10. 네트워크 관점에서 고려한 사항

* Cookie 기반 인증 요청은 credentials/Cookie 헤더 필요
* 공개 GET은 쿠키 없이 호출 가능

### 11. 설계를 설명할 때 점검할 질문

* PUT과 DELETE에서 왜 user_id를 비교하는가?
* 401/403/404를 어떻게 나누는가?
* GET이 공개인 이유는?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* REST CRUD와 상태코드
* IDOR 방어로서의 소유권 검사
* AuthN/AuthZ가 라우트별로 어떻게 겹치는가

---

## STEP 14 - 댓글

> 사용자 요청 제목: `STEP 12 - 댓글`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 14로 기록한다.

### 1. 학습 질문

* 댓글 API의 인증/인가/공개 범위는?
* 존재하지 않는 postId, 타인 comment 삭제, 미로그인 작성, 잘못된/만료 JWT는?
* posts와 comments의 DB 관계는?

### 2. 학습한 이론

* comments는 posts에 종속(1:N). post 삭제시 CASCADE로 댓글도 삭제되도록 스키마에 정의됨.
* comments.user_id는 작성자, comments.post_id는 소속 게시글.
* 삭제는 Authentication + Authorization(작성자)이 필요.

### 3. 설계 판단

* `POST /api/posts/:postId/comments` — requireAuth, post 존재 확인
* `GET /api/posts/:postId/comments` — 공개, post 존재 확인
* `DELETE /api/comments/:commentId` — requireAuth + 댓글 작성자 소유권
* 경로 param을 `commentId`로 명시

### 4. 설계 이유

* 목록 GET이 없으면 클라이언트 검증이 어려워 공개 목록 API 추가
* 삭제 경로를 `/comments/:commentId`로 요구사항에 맞춤

#### 설계 변경

* 기존 설계: POST create + DELETE `/:id`만 존재, 목록 없음
* 변경 이유: STEP 12가 GET 목록과 `:commentId`를 명시
* 새로운 설계: GET 목록 추가, DELETE param `commentId`

### 5. Cursor에게 전달한 명령

```text
# STEP 12 - 댓글

댓글 기능을 구현한다.

API:

POST /posts/:postId/comments
GET /posts/:postId/comments
DELETE /comments/:commentId

권한:

POST

* 로그인 사용자

GET

* 공개

DELETE

* 댓글 작성자 본인

검증:

* 존재하는 post인지
* 인증된 user인지
* 댓글 작성자인지

Backend에서 권한 검증을 수행한다.

다음 공격 시나리오를 테스트한다.

* 존재하지 않는 postId
* 다른 사용자의 commentId 삭제
* 로그인하지 않은 댓글 작성
* 잘못된 JWT
* 만료된 JWT

구현 후 게시글과 댓글의 DB 관계도 다시 설명해줘.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `GET /api/posts/:postId/comments` 추가
* `DELETE /api/comments/:commentId` param 이름 정리
* repository `findByPostId`, service `listByPostId`
* `src/scripts/testComments.ts`

#### Cursor가 임의로 추가한 부분 (검토 대상)

* 댓글 목록 정렬 `created_at ASC`
* 테스트 스크립트

### 7. 테스트 및 검증 결과

* typecheck 성공
* 존재하지 않는 postId → 404
* 타인 comment 삭제 → 403
* 미로그인 작성 → 401
* 잘못된 JWT → `INVALID_TOKEN`
* 만료 JWT → `TOKEN_EXPIRED`
* 본인 삭제 → 200, 공개 목록 → 200

### 8. 발견된 문제와 해결 방법

* 특이 버그 없음
* GET `/:postId/comments`를 GET `/:id`보다 앞에 두어 라우팅 충돌 방지

### 9. 보안상 고려한 사항

* Backend에서 post 존재·인증·작성자 소유권 검증
* IDOR(타인 commentId) → 403

### 10. 네트워크 관점에서 고려한 사항

* GET 목록은 쿠키 없이 호출 가능
* POST/DELETE는 Cookie 필요

### 11. 설계를 설명할 때 점검할 질문

* posts:comments 관계는?
* 게시글 삭제 시 댓글은?
* 왜 Frontend 삭제가 아닌 Backend 소유권 검사인가?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 1:N FK 관계와 ON DELETE CASCADE
* 댓글 인가 규칙
* 401/403/404 구분

---

## STEP 15 - Pagination

> 사용자 요청 제목: `STEP 13 - Pagination`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 15로 기록한다.

### 1. 학습 질문

* 왜 Frontend에서 전체 데이터를 받아 slice하면 안 되는가?
* Server-side pagination의 장점, LIMIT/OFFSET, page↔offset 관계는?
* limit 무제한의 문제와 validation 방법은?

### 2. 학습한 이론

* 클라이언트 slice는 전체 payload를 받아 전송/메모리 비용이 커지고, 데이터가 늘수록 성능이 악화된다.
* 서버 pagination은 필요한 행만 DB에서 가져와 대역폭·응답 시간을 줄인다.
* `offset = (page - 1) * limit`, `totalPages = ceil(total / limit)`.
* limit 상한 없이 허용하면 대량 SELECT로 DB/네트워크 DoS에 가깝게 악용될 수 있다.

### 3. 설계 판단

* `GET /api/posts?page=&limit=`
* 기본: page=1, limit=10, max limit=100
* SQL: `LIMIT $1 OFFSET $2` + `COUNT(*)`
* 응답: `{ data: Post[], pagination: { page, limit, total, totalPages } }`

### 4. 설계 이유

* 요구 응답 형식에 `data`를 배열로 두어 목록 전용 계약을 명확히 함
* max limit으로 과도한 조회 차단
* 선택하지 않은 대안: cursor-based pagination — 이번 요구는 page/limit

#### 설계 변경

* 기존 설계: `GET /posts`가 전체 목록을 `{ data: { posts } }`로 반환
* 변경 이유: 서버 사이드 pagination 요구
* 새로운 설계: LIMIT/OFFSET + `{ data, pagination }`

### 5. Cursor에게 전달한 명령

```text
# STEP 13 - Pagination

게시글 목록 API에 서버 사이드 Pagination을 구현한다.

API:

GET /posts?page=1&limit=10

Backend에서:

* page validation
* limit validation
* offset 계산
* LIMIT/OFFSET
* total count
* totalPages

를 처리한다.

응답:

{
data: [],
pagination: {
page,
limit,
total,
totalPages
}
}

먼저 설명해줘.

* 왜 Frontend에서 전체 데이터를 받아 slice하면 안 되는가?
* Server-side pagination의 장점
* LIMIT/OFFSET의 의미
* page와 offset의 관계
* limit을 무제한으로 허용하면 어떤 문제가 생기는가?
* pagination parameter를 어떻게 validation해야 하는가?

그 후 구현한다.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `utils/pagination.ts`, `sendPaginated`
* post repository LIMIT/OFFSET + countAll
* list service/controller/route에 query validation
* `scripts/testPagination.ts`

#### Cursor가 임의로 추가한 부분 (검토 대상)

* `MAX_LIMIT = 100`
* 기본 page=1, limit=10
* total=0일 때 totalPages=0

### 7. 테스트 및 검증 결과

* typecheck 성공
* `?page=1&limit=2` → 200, data 배열 + pagination
* 기본값 page=1 limit=10
* page=0 → 400
* limit=1000 → 400 (max 초과)

### 8. 발견된 문제와 해결 방법

* 특이 버그 없음
* 기존 list 응답 shape 변경으로 testPostCrud 목록 검증을 배열 기준으로 수정

### 9. 보안상 고려한 사항

* limit 상한으로 대량 조회 남용 완화
* page/limit 양의 정수 validation
* SQL은 파라미터 바인딩

### 10. 네트워크 관점에서 고려한 사항

* 페이지 단위로 payload 크기 제한 → 대역폭·지연 감소
* total/totalPages로 클라이언트가 추가 round-trip 없이 UI 구성 가능

### 11. 설계를 설명할 때 점검할 질문

* 왜 클라이언트 slice가 안 되나?
* offset 공식은?
* limit max가 왜 필요한가?
* OFFSET의 성능 한계(깊은 페이지)는?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 서버 사이드 pagination 목적
* LIMIT/OFFSET과 page 관계
* 입력 validation과 DoS/부하 관점

---

## STEP 16 - Swagger API 문서

> 사용자 요청 제목: `STEP 14 - Swagger API 문서`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 16으로 기록한다.

### 1. 학습 질문

* REST API를 Swagger/OpenAPI로 문서화할 때 무엇을 포함해야 하는가?
* 인증이 필요한 API를 Swagger UI에서 어떻게 테스트하는가?
* 문서와 구현이 어긋나지 않게 검증하려면?

### 2. 학습한 이론

* OpenAPI는 Method/URL/Parameters/Request Body/Response/Status/Auth/Error를 기계가 읽을 수 있게 기술한다.
* Swagger UI는 OpenAPI 스펙을 렌더링하고 Try it out으로 실제 HTTP를 보낸다.
* Cookie 기반 JWT는 로그인 응답의 Set-Cookie + `withCredentials`로 동일 출처에서 보호 API를 호출한다.
* HttpOnly 쿠키는 JS로 읽을 수 없으므로 Authorize에 토큰을 붙여넣기보다 로그인 후 브라우저가 자동 전송하는 방식이 맞다.

### 3. 설계 판단

* `swagger-ui-express` + 단일 OpenAPI 3.0 스펙(`src/docs/openapi.ts`)
* UI: `GET /api/docs`, JSON: `GET /api/docs.json`
* securityScheme: `cookieAuth` (apiKey in cookie, name=`access_token`)
* 보호 API에 `security: [{ cookieAuth: [] }]`
* 커버리지 검증 스크립트: `verifySwaggerCoverage.ts`

### 4. 설계 이유

* JSDoc 분산보다 한 파일 스펙이 라우트 대조·유지에 유리하다.
* 서버 path prefix `/api`와 servers.url `/api`를 맞춰 UI 요청 경로를 단순화한다.
* 문서-구현 불일치는 배포 전 스크립트로 fail 시킨다.

### 5. Cursor에게 전달한 명령

```
# STEP 14 - Swagger API 문서

현재 구현된 모든 REST API를 Swagger로 문서화한다.

각 API에:

* Method
* URL
* Parameters
* Request Body
* Response
* Status Code
* Authentication
* Error Response

를 문서화한다.

인증이 필요한 API는 Swagger에서 인증 상태를 사용하여 테스트할 수 있도록 구성한다.

Swagger 문서와 실제 API 구현이 일치하는지 검증한다.

구현 후 전체 API 목록을 출력하고,
누락된 API가 없는지 확인해줘.
```

### 6. Cursor 구현 결과

* `backend/src/docs/openapi.ts` — 전체 path 정의
* `backend/src/config/swagger.ts` — UI 마운트, persistAuthorization, withCredentials
* `app.ts`에 `setupSwagger` 연결
* `scripts/verifySwaggerCoverage.ts`

#### Cursor가 임의로 추가한 부분 (검토 대상)

* `/api/docs.json` 엔드포인트
* 커버리지 검증용 implemented baseline 목록

### 7. 테스트 및 검증 결과

* typecheck 성공
* documented vs implemented: Missing/Extra 없음 (13개 API)
* `GET /api/docs.json` → 200, paths 9
* `GET /api/docs/` → 200

### 8. 발견된 문제와 해결 방법

* HttpOnly라 Authorize 수동 입력은 비현실적 → 로그인 Try it out 후 쿠키 자동 전송으로 안내

### 9. 보안상 고려한 사항

* Swagger는 개발 편의용; 프로덕션에서는 docs 비활성/보호를 검토할 수 있음
* 문서에 에러 스키마(`ErrorResponse`)와 401/403/404를 명시해 클라이언트 기대치를 고정

### 10. 네트워크 관점에서 고려한 사항

* docs는 같은 origin(`localhost:4000`)에서 서빙 → 로그인 쿠키가 Try it out에 포함됨
* CORS credentials와 동일한 쿠키 모델

### 11. 설계를 설명할 때 점검할 질문

* OpenAPI와 Swagger UI 차이는?
* Cookie securityScheme이 Bearer와 다른 점은?
* 문서-구현 drift를 어떻게 막는가?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* OpenAPI 스펙 구조(paths, components, security)
* HttpOnly Cookie + Swagger 테스트 흐름
* 스펙과 라우트 동기화 검증

---

## STEP 17 - Frontend API Layer

> 사용자 요청 제목: `STEP 15 - Frontend API Layer`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 17로 기록한다.

### 1. 학습 질문

* API Client가 필요한 이유는?
* Service Layer가 필요한 이유는?
* Component에서 직접 API를 호출하면 어떤 문제가 생기는가?
* Cookie 인증에서 credentials가 필요한 이유는?

### 2. 학습한 이론

* API Client는 base URL, credentials, JSON, status/error 처리를 한곳에 모아 중복과 불일치를 줄인다.
* Service는 도메인별 엔드포인트·요청/응답 형태를 감싸 Component가 HTTP 세부사항을 모르게 한다.
* Component 직접 fetch는 URL·헤더·에러 파싱이 분산되어 유지보수·테스트·인증 누락이 쉽다.
* 브라우저 기본 fetch는 cross-origin에서 쿠키를 보내지 않는다. `credentials: 'include'`와 서버 CORS `credentials: true`가 함께 필요하다.

### 3. 설계 판단

* 구조: Component → Service → API Client → Backend
* `src/lib/api/client.ts` — 공통 client (`credentials: 'include'` 기본)
* `ApiError`로 status/code/message/details 통일
* `src/services/auth|posts|comments.service.ts` 분리
* `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api`

### 4. 설계 이유

* axios 없이 fetch로 충분하고 의존성을 늘리지 않는다.
* Service에서 `{ data }` / pagination envelope를 도메인 객체로 풀어 UI가 단순해진다.
* Cookie(HttpOnly)는 JS로 읽지 않으므로 Authorization 헤더 대신 credentials로 쿠키 전송.

### 5. Cursor에게 전달한 명령

```
# STEP 15 - Frontend API Layer

이제 Next.js Frontend의 API 통신 구조를 구현한다.

Component에서 fetch/axios를 직접 반복 작성하지 않는다.

다음 구조를 사용한다.

Component
→ Hook 또는 Service
→ API Client
→ Backend

구현한다.

* 공통 API client
* base URL
* credentials
* JSON 처리
* HTTP status 처리
* 공통 error 처리

다음 API service를 분리한다.

* auth
* posts
* comments

Cookie 기반 인증을 사용하므로 필요한 credentials 설정을 적용한다.

먼저 설명해줘.

* API Client가 필요한 이유
* Service Layer가 필요한 이유
* Component에서 직접 API를 호출하면 어떤 문제가 생기는지
* Cookie 인증에서 credentials가 필요한 이유

그 후 구현한다.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `frontend/src/lib/api/client.ts` — base URL, credentials, JSON, status→ApiError
* `frontend/src/lib/api/errors.ts`, `types.ts`, `index.ts`
* `frontend/src/services/auth.service.ts`
* `frontend/src/services/posts.service.ts`
* `frontend/src/services/comments.service.ts`
* `frontend/src/services/index.ts`
* `frontend/.env.local`, `.env.example`
* `.gitignore`에 `!.env.example` 예외 추가

#### Cursor가 임의로 추가한 부분 (검토 대상)

* Hook은 이번 STEP에서 만들지 않음 (Service로 충분; Hook은 UI 단계에서 추가 가능)
* `apiPaginated` / `getPaginated` 헬퍼
* `ApiError` convenience getters (`isUnauthorized` 등)

### 7. 테스트 및 검증 결과

* `npx tsc --noEmit` 성공 (exit 0)

### 8. 발견된 문제와 해결 방법

* `.gitignore`의 `.env*`가 `.env.example`까지 무시 → `!.env.example` 추가

### 9. 보안상 고려한 사항

* 토큰을 localStorage에 두지 않고 Cookie + credentials만 사용
* 에러 메시지/code만 UI에 노출하고 raw Response 파싱은 client에 집중

### 10. 네트워크 관점에서 고려한 사항

* Frontend origin `localhost:3000` → Backend `localhost:4000` cross-origin
* `credentials: 'include'` ↔ Backend CORS `credentials: true` + `FRONTEND_ORIGIN`
* SameSite=Lax로 일반 네비게이션·same-site 요청에서 쿠키 전송

### 11. 설계를 설명할 때 점검할 질문

* 왜 Component에서 fetch를 직접 쓰면 안 되나?
* credentials omit vs include 차이는?
* Service와 API Client 책임 분리는?
* `{ data }` envelope을 어디서 벗기는가?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 레이어드 Frontend API 구조
* Cookie 기반 cross-origin 인증과 credentials
* 공통 에러 모델과 도메인 Service

---

## STEP 18 - Frontend 상태관리 (Zustand)

> 사용자 요청 제목: `STEP 16 - Frontend 상태관리`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 18로 기록한다.

### 1. 학습 질문

* Global / Local / Server State의 차이는?
* Zustand를 쓰는 이유는?
* 게시글 목록을 전역 상태로 두지 않는 이유는?
* 로그인 사용자 정보는 왜 전역인가?

### 2. 학습한 이론

* Global: 여러 화면이 공유하는 클라이언트 상태 (인증 사용자/상태)
* Local: 컴포넌트에 가두는 UI 상태 (form, modal, 토글)
* Server: API가 source of truth인 데이터 (posts, comments) — 캐시/재검증이 핵심
* Zustand는 보일러플레이트 적은 Client Global store
* 서버 목록을 전역에 복제하면 신선도·동기화·메모리 문제가 커진다
* 인증 사용자는 라우트/헤더/권한 UI가 동시에 참조하므로 Global이 맞다

### 3. 설계 판단

* Zustand `useAuthStore`
* status: `loading` | `authenticated` | `unauthenticated`
* user: `User | null`
* `initialize()` → `GET /auth/me`
* `login()` → service 후 store 갱신
* posts/comments는 store에 넣지 않음
* `AuthProvider`로 앱 시작 시 initialize

### 4. 설계 이유

* 쿠키 세션은 새로고침 후에도 유효 → 첫 로드에 me로 확인 필요 → loading 구분
* 서버 데이터는 페이지/쿼리별로 fetch하는 편이 단순 (이후 React Query 등 가능)
* Redux보다 Zustand가 학습·구현 비용이 낮다

### 5. Cursor에게 전달한 명령

```
# STEP 16 - Frontend 상태관리

Zustand를 사용하여 Client State를 관리한다.

먼저 상태를 다음과 같이 분류한다.

Global State

* authenticated user
* authentication status

Local State

* form input
* modal
* UI 상태

Server Data

* posts
* comments

모든 서버 데이터를 Zustand에 저장하지 않는다.

먼저 다음을 설명해줘.

* Global State
* Local State
* Server State
* Zustand를 사용하는 이유
* 게시글 목록을 전역 상태로 관리하지 않는 이유
* 로그인 사용자 정보를 전역 상태로 관리하는 이유

그 후 auth store를 구현한다.

인증 상태는:

* loading
* authenticated
* unauthenticated

세 상태를 구분한다.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `zustand` 의존성 추가
* `frontend/src/stores/auth.store.ts`
* `frontend/src/stores/index.ts`
* `frontend/src/components/AuthProvider.tsx`
* `layout.tsx`에 AuthProvider 연결

#### Cursor가 임의로 추가한 부분 (검토 대상)

* `AuthProvider` (initialize 부트스트랩)
* `clearSession` (서버 logout API 전 클라이언트 클리어)
* 401 외 에러도 unauthenticated로 처리

### 7. 테스트 및 검증 결과

* `npx tsc --noEmit` 성공

### 8. 발견된 문제와 해결 방법

* 서버 logout API 없음 → `clearSession`은 클라이언트 상태만 초기화 (쿠키는 남아 있을 수 있음; 이후 logout STEP에서 정리)

### 9. 보안상 고려한 사항

* JWT를 store/localStorage에 저장하지 않음 — user 프로필만 보관, 인증은 HttpOnly Cookie
* initialize는 `/auth/me`로 서버가 최종 판정

### 10. 네트워크 관점에서 고려한 사항

* 앱 로드 시 me 1회 round-trip으로 세션 확인
* credentials include로 쿠키 전송

### 11. 설계를 설명할 때 점검할 질문

* loading을 왜 두는가?
* Server State를 Zustand에 넣으면?
* auth user와 access token의 차이는?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* Global / Local / Server State 분류
* Zustand 역할 범위
* Cookie 세션 + Client auth mirror 패턴

---

## STEP 19 - 로그인 상태 확인 (/auth/me)

> 사용자 요청 제목: `STEP 17 - 로그인 상태 확인`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 19로 기록한다.

### 1. 학습 질문

* 왜 Frontend가 JWT를 직접 읽지 않는가?
* /auth/me가 필요한 이유는?
* Cookie와 Zustand의 역할 차이는?
* 새로고침 후 Zustand가 비워져도 인증을 어떻게 복구하는가?
* loading 상태가 필요한 이유는?

### 2. 학습한 이론

* HttpOnly Cookie의 JWT는 JS가 읽을 수 없어 XSS로 토큰 탈취가 어렵다.
* /auth/me는 쿠키를 서버가 검증한 뒤 “현재 사용자”를 돌려주는 세션 확인 API다.
* Cookie = 인증 증명의 source of truth / Zustand = UI용 미러(user, status)
* 새로고침 시 store는 초기화되지만 Cookie는 남고, 앱 시작 시 me로 다시 채운다.
* me 응답 전후로 보호 UI가 깜빡이지 않게 loading이 필요하다.

### 3. 설계 판단

* Application 시작 → AuthProvider → initialize → GET /auth/me (credentials include)
* status: loading → authenticated | unauthenticated
* bootstrapPromise로 Strict Mode 중복 me 호출 방지
* AuthSessionPanel로 새로고침 후 상태 시각 확인
* testSessionRestore.ts로 Cookie 유지 + me 재호출 검증

### 4. 설계 이유

* JWT를 localStorage/Zustand에 두지 않아 클라이언트 저장 위험을 줄인다.
* 서버 검증 결과를 UI 상태로만 반영해 권한 판정의 최종 권한을 Backend에 둔다.

### 5. Cursor에게 전달한 명령

```
# STEP 17 - 로그인 상태 확인

JWT는 HttpOnly Cookie에 저장되어 있으므로 Frontend JavaScript가 JWT 자체를 읽지 않는다.

대신 다음 API를 구현/사용한다.

GET /auth/me

흐름:

Application 시작
→ /auth/me
→ Cookie 자동 전달
→ Backend JWT 검증
→ user 반환
→ Zustand auth store 업데이트

새로고침 후에도 로그인 상태가 유지되는 구조를 구현한다.

먼저 설명해줘.

* 왜 Frontend가 JWT를 직접 읽지 않는가?
* /auth/me가 필요한 이유
* Cookie와 Zustand의 역할 차이
* 새로고침하면 Zustand가 초기화될 수 있는데 어떻게 인증 상태를 복구하는가?
* loading 상태가 필요한 이유

그 후 구현하고 실제 새로고침 시나리오를 테스트한다.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* auth store initialize 강화 (bootstrapPromise)
* AuthProvider 주석/흐름 명확화
* `AuthSessionPanel` + home 페이지 표시
* `backend/src/scripts/testSessionRestore.ts`

#### Cursor가 임의로 추가한 부분 (검토 대상)

* AuthSessionPanel (검증용 UI)
* bootstrapPromise 싱글톤

### 7. 테스트 및 검증 결과

* testSessionRestore: login Cookie → me 200 → (refresh 시뮬레이션) me 200 동일 이메일 → Cookie 없이 me 401 → PASS
* frontend `tsc --noEmit` 성공

### 8. 발견된 문제와 해결 방법

* Strict Mode 이중 mount 시 me 중복 가능 → bootstrapPromise로 1회만 실행

### 9. 보안상 고려한 사항

* JS는 JWT를 읽지 않음 (HttpOnly)
* 인증 최종 판정은 Backend requireAuth + jwt.verify

### 10. 네트워크 관점에서 고려한 사항

* 앱 로드마다 me 1회 round-trip
* credentials include로 cross-origin Cookie 전달

### 11. 설계를 설명할 때 점검할 질문

* localStorage에 JWT 두면 왜 안 되나?
* Zustand persist로 user를 저장하면?
* Cookie 만료 후 새로고침하면?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* HttpOnly Cookie + /auth/me 세션 복구
* Cookie(진실) vs Zustand(UI 미러)
* loading으로 세션 확인 race 방지

---

## STEP 20 - Authentication UI

> 사용자 요청 제목: `STEP 18 - Authentication UI`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 20으로 기록한다.

### 1. 학습 질문

* Auth UI에서 최종 인증/권한을 클라이언트가 판단하면 안 되는 이유는?
* 로그인 실패 메시지를 어디서 가져와야 하는가?
* 회원가입 validation은 클라이언트와 서버 중 어디에 두는가?

### 2. 학습한 이론

* UI는 API 응답(status/code/message)을 표현할 뿐, 권한의 source of truth는 Backend다.
* 클라이언트 validation은 UX(조기 피드백)용이고, 최종 거부는 서버 validation/auth다.
* 로그인 실패(401/403) 메시지는 ApiError.message로 표시한다.

### 3. 설계 판단

* 페이지: `/login`, `/register`, `/verify-email`
* Header에 auth status 표시 (store ← /auth/me 또는 login 응답)
* Register: 클라이언트 형식 검사 + POST register
* Verify: query token 자동 검증 + 수동 입력
* Login: store.login → API → 실패 시 API 메시지

### 4. 설계 이유

* 과제 필수 기능 중심의 단순 폼 UI
* Service/Zustand를 재사용해 Component에 fetch를 두지 않음

### 5. Cursor에게 전달한 명령

```
# STEP 18 - Authentication UI

이제 실제 Frontend UI를 구현한다.

페이지:

* /login
* /register
* 이메일 인증 결과 페이지

UI는 과제의 필수 기능을 충족하는 수준으로 구현한다.

기능:

* 회원가입
* 이메일 인증
* 로그인
* 로그인 실패 메시지
* 회원가입 validation
* 인증 상태 표시

UI에서 인증이나 권한을 최종적으로 판단하지 않는다.

API의 응답을 기준으로 상태를 표현한다.

구현 후 각 UI에서 실제 어떤 API가 호출되는지 정리해줘.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `app/login/page.tsx`, `RegisterForm`, `LoginForm`
* `app/register/page.tsx`
* `app/verify-email/page.tsx` + `VerifyEmailPanel` (Suspense)
* `AppHeader` 인증 상태 표시
* `lib/authValidation.ts`
* `auth.module.css`
* layout에 AppHeader 연결

#### Cursor가 임의로 추가한 부분 (검토 대상)

* 회원가입 성공 시 devVerificationToken 링크
* verify-email query `?token=` 자동 호출

### 7. 테스트 및 검증 결과

* `npx tsc --noEmit` 성공

### 8. 발견된 문제와 해결 방법

* `useSearchParams`는 Suspense boundary 필요 → verify-email 페이지에 Suspense 적용

### 9. 보안상 고려한 사항

* UI가 JWT/권한을 자체 판정하지 않음
* 에러 문구는 서버 message 사용 (클라이언트 추측 메시지 최소화)
* 비밀번호는 store에 저장하지 않음

### 10. 네트워크 관점에서 고려한 사항

* login/register/verify는 credentials include (cookie Set/전송)
* 앱 전역 Header는 기존 /auth/me bootstrap 결과 표시

### 11. 설계를 설명할 때 점검할 질문

* 클라이언트 validation만으로 충분한가?
* 로그인 실패 메시지를 UI가 만들어도 되나?
* 인증 상태 표시의 근거는?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* UI는 표현, Backend는 판정
* Auth 페이지별 호출 API 매핑
* ApiError 기반 실패 메시지

---

## STEP 21 - 게시판 Frontend

> 사용자 요청 제목: `STEP 19 - 게시판 Frontend`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 21로 기록한다.

### 1. 학습 질문

* Frontend에서 작성자 버튼을 숨기는 것과 보안 검증의 차이는?
* loading/error/empty를 왜 UI에서 처리해야 하는가?
* 게시글/댓글 API는 페이지별로 어떻게 매핑되는가?

### 2. 학습한 이론

* UI 소유권 비교(`user.id === post.userId`)는 UX일 뿐, 실제 인가는 Backend 403/401이다.
* Server data는 페이지 로컬 state로 fetch하고 Zustand에 넣지 않는다.
* loading/error/empty는 네트워크 비동기 UI의 기본 상태다.

### 3. 설계 판단

* `/posts` 목록+pagination
* `/posts/new` 작성
* `/posts/[id]` 상세+댓글 CRUD
* `/posts/[id]/edit` 수정
* 서비스 레이어 재사용 (`postsService`, `commentsService`)

### 4. 설계 이유

* 기존 API Client/Service를 그대로 사용해 Component에 fetch를 두지 않음
* 소유 버튼 숨김은 UX, 실패 메시지는 ApiError로 표시

### 5. Cursor에게 전달한 명령

```
# STEP 19 - 게시판 Frontend

이제 게시판 UI를 구현한다.

페이지:

* 게시글 목록
* 게시글 상세
* 게시글 작성
* 게시글 수정

필수 기능:

* 목록
* Pagination
* 상세
* 작성
* 수정
* 삭제
* 댓글 작성
* 댓글 조회
* 댓글 삭제

Frontend에서 작성자 여부를 확인하여 버튼을 숨길 수는 있지만,
이를 보안 검증으로 사용하지 않는다.

실제 권한은 Backend API가 결정한다.

API loading/error/empty 상태를 UI에서 처리한다.

구현 후 각 페이지가 어떤 API를 호출하는지 정리해줘.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `PostsList`, `PostDetail`, `PostCreateForm`, `PostEditForm`
* `app/posts/page.tsx`, `posts/new`, `posts/[id]`, `posts/[id]/edit`
* `board.module.css`, `lib/ui.ts`
* Header에 Posts / New post 링크

#### Cursor가 임의로 추가한 부분 (검토 대상)

* 목록 limit 기본 10
* 수정 페이지에서 비작성자에게 Save 버튼 숨김 + 경고 문구

### 7. 테스트 및 검증 결과

* `npx tsc --noEmit` 성공

### 8. 발견된 문제와 해결 방법

* `useSearchParams` 사용 목록 페이지에 Suspense 적용

### 9. 보안상 고려한 사항

* 작성자 버튼 숨김 ≠ 보안
* 삭제/수정/댓글 쓰기는 API 401/403이 최종 판정
* 에러 메시지는 서버 응답 기준

### 10. 네트워크 관점에서 고려한 사항

* 목록은 page query로 서버 pagination
* 상세는 post + comments 병렬 로드
* credentials include로 보호 API 쿠키 전송

### 11. 설계를 설명할 때 점검할 질문

* 왜 Frontend ownership check만으로 부족한가?
* posts를 Zustand에 안 넣는 이유는?
* empty와 error를 어떻게 구분하는가?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* UX 가드 vs API 인가
* 페이지별 API 매핑
* loading/error/empty 상태 설계

---

## STEP 22 - Protected Route

> 사용자 요청 제목: `STEP 20 - Protected Route`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 22로 기록한다.

### 1. 학습 질문

* Frontend Route Guard와 Backend Authorization의 차이는?
* 비로그인 → /posts/write 시 무엇이 일어나는가?
* 비로그인 POST /posts 직접 호출은 왜 막히는가?
* 타인 글 PUT은 왜 403인가?

### 2. 학습한 이론

* Route Guard: 클라이언트 UX — 화면 접근을 줄이고 login으로 유도. 우회 가능.
* Backend Authorization: 서버가 쿠키 JWT·소유권을 검증. 우회 불가(정상 API 경로).
* 401 = 인증 없음, 403 = 인증됐지만 권한 없음.

### 3. 설계 판단

* `RequireAuth`: loading 대기 → unauthenticated 시 `/login?next=`
* 보호: `/posts/write`, `/posts/[id]/edit`
* `/posts/new` → `/posts/write` redirect
* Login 성공 시 `next`로 복귀 (open-redirect 방지: `/`로 시작하는 상대경로만)

### 4. 설계 이유

* 가드는 편의, API가 보안의 역할을 분리해 혼동을 줄인다.

기존 설계: 작성 경로 `/posts/new`  
→ 변경 이유: 과제 예시 경로 `/posts/write`  
→ 새로운 설계: `/posts/write` + new는 redirect

### 5. Cursor에게 전달한 명령

```
# STEP 20 - Protected Route

인증이 필요한 Frontend 페이지를 보호한다.

예:

/posts/write
/posts/:id/edit

비로그인 사용자가 접근하면 login으로 이동한다.

단, 이것은 UX 수준의 접근 제어이며 실제 보안은 Backend API에서 수행한다.

다음 상황을 테스트한다.

1. 비로그인 → /posts/write
2. 로그인 → /posts/write
3. 비로그인 → POST /posts 직접 호출
4. 로그인 사용자 → 다른 사람의 PUT /posts/:id 직접 호출

Frontend Route Guard와 Backend Authorization의 차이를 명확히 설명해줘.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* `RequireAuth.tsx`
* `app/posts/write/page.tsx`
* edit 페이지에 RequireAuth
* `posts/new` → write redirect
* LoginForm `?next=` 복귀
* `testProtectedRoute.ts`

### 7. 테스트 및 검증 결과

* 3) POST /posts no cookie → **401**
* 4) B PUT A의 post → **403**
* 1–2) 브라우저 체크리스트: 비로그인 write → login?next=, 로그인 시 폼
* `tsc --noEmit` 성공

### 8. 발견된 문제와 해결 방법

* Login `useSearchParams` → Suspense boundary 추가

### 9. 보안상 고려한 사항

* Route Guard만으로 보안 성립하지 않음
* `next` open-redirect 방지
* 소유권은 assertResourceOwner (Backend)

### 10. 네트워크 관점에서 고려한 사항

* Guard 우회 시에도 API는 Cookie 없으면 401, 타 소유면 403
* 보호 페이지 진입 전 /auth/me 완료 대기

### 11. 설계를 설명할 때 점검할 질문

* Guard를 끄면 데이터가 뚫리나?
* 401과 403 차이는?
* next 파라미터 위험은?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* UX Route Guard vs Backend Authorization
* 401/403
* Cookie 기반 API 인가가 실제 보안

---

## STEP 23 - Error Handling

> 사용자 요청 제목: `STEP 21 - Error Handling`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 23으로 기록한다.

### 1. 학습 질문

* Backend 에러 분류(Validation~Internal)와 HTTP 매핑은?
* Frontend가 400/401/403/404/409/500을 어떻게 표현하는가?
* 401 시 auth 초기화·로그인 이동을 왜 API Client에서 하는가?
* error response에 민감정보가 나가면 안 되는 이유는?

### 2. 학습한 이론

* 서버: 의도된 AppError → 상태코드+code+message(+details), 알 수 없는 예외 → 500 일반 메시지
* 클라이언트: ApiError로 통일, UI는 user-facing 메시지 규칙 적용
* 401: 세션 무효 → store clear + login (me/login은 예외)
* 403/404/500: 권한 없음 / 없음 / 일반 서버 오류 UI
* stack·시크릿·비밀번호 해시는 응답에 넣지 않음

### 3. 설계 판단

* Backend `errorHandler` 5xx 응답 일반화
* Frontend `getUserFacingMessage` + `ApiErrorView`
* `setUnauthorizedHandler` in AuthProvider
* `skipUnauthorizedHandling` for `/auth/me`, `/auth/login`

### 4. 설계 이유

* 에러 정책을 한곳(API Client / errorHandler)에 모아 페이지마다 다른 처리를 막음
* me/login의 401은 “비로그인” 정상 흐름이라 리다이렉트 루프를 피함

### 5. Cursor에게 전달한 명령

```
# STEP 21 - Error Handling

Frontend와 Backend의 에러 처리 구조를 최종 정리한다.

Backend:

* Validation
* Authentication
* Authorization
* Not Found
* Conflict
* Internal Error

Frontend:

* 400
* 401
* 403
* 404
* 409
* 500

API Client에서 공통 에러 처리를 담당한다.

401 발생 시:

* auth state 초기화
* 로그인 페이지 이동

403 발생 시:

* 권한 없음 UI

404:

* 리소스 없음 UI

500:

* 일반적인 서버 오류 메시지

민감한 정보가 error response에 노출되지 않는지도 검토한다.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* Backend `errorHandler.ts` 정리·5xx 일반화
* Frontend `errors.ts` (`getUserFacingMessage`)
* `client.ts` 401 핸들러 + network/invalid JSON 안전 처리
* `AuthProvider` 401 등록
* `ApiErrorView`, `PostDetail` 연동
* `testErrorResponses.ts`

### 7. 테스트 및 검증 결과

* 400/401/404/409 envelope 확인, stack/secret 미포함 → PASS
* frontend/backend typecheck 경로 tsc 성공

### 8. 발견된 문제와 해결 방법

* /auth/me 401이 로그인으로 튕기면 부트스트랩 루프 → `skipUnauthorizedHandling`

### 9. 보안상 고려한 사항

* 5xx 클라이언트 메시지 고정
* credentials 실패는 동일 문구(이메일/비밀번호)
* details에 비밀번호 값 미포함
* 비JSON 응답 원문을 UI에 넣지 않음

### 10. 네트워크 관점에서 고려한 사항

* fetch 네트워크 실패도 ApiError(500 계열 메시지)로 통일
* 401 후 full navigation으로 쿠키·store 상태 재정렬

### 11. 설계를 설명할 때 점검할 질문

* 401과 403 UI 차이는?
* 왜 500 원문을 보여주면 안 되나?
* skipUnauthorizedHandling이 필요한 이유는?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* Backend 에러 분류 ↔ HTTP
* API Client 공통 처리와 401 세션 정책
* 민감정보 비노출

---

## STEP 24 - Security Audit

> 사용자 요청 제목: `STEP 22 - Security Audit`  
> 로그 번호는 기존 기록을 덮어쓰지 않기 위해 STEP 24로 기록한다.

### 1. 학습 질문

* AuthN/AuthZ/Input/Browser/Frontend/Backend를 어떤 기준으로 감사하는가?
* 발견된 문제를 즉시 고치지 않고 목록화하는 이유는?
* Route Guard와 API 인가를 혼동하면 어떤 위험이 있는가?

### 2. 학습한 이론

* 보안 감사는 위협(공격 시나리오)·영향·잔존 위험·개선안을 코드와 연결해 기록한다.
* “구현됨”과 “운영 설정까지 안전”은 다르다 (JWT_SECRET, Secure, Swagger 노출 등).
* IDOR/BOLA는 서버 ownership 검사가 없으면 성립한다.

### 3. 설계 판단

* 이번 STEP은 **수정 없이** 감사 목록만 산출
* 잘 된 항목(서명 검증, ownership, SQL 파라미터, HttpOnly, localStorage 미사용 등)과 잔존 이슈를 분리

### 4. 설계 이유

* 먼저 전체 위협 지도를 보고 우선순위를 정한 뒤 다음 STEP에서 패치하는 편이 안전하다.

### 5. Cursor에게 전달한 명령

```
# STEP 22 - Security Audit

현재 프로젝트 전체를 보안 관점에서 코드 리뷰한다.

다음 항목을 반드시 검사한다.

Authentication

* JWT signature
* JWT expiration
* JWT secret
* Cookie

Authorization

* IDOR
* BOLA
* 다른 사용자의 게시글 수정/삭제
* 다른 사용자의 댓글 삭제

Input

* SQL Injection
* XSS
* validation
* parameter validation

Browser

* CORS
* CSRF
* Cookie
* HttpOnly
* Secure
* SameSite

Frontend

* localStorage 민감정보
* Client-side authorization 의존
* 인증 상태 조작

Backend

* password 노출
* JWT 노출
* DB credential 노출
* stack trace 노출
* 환경변수 노출

각 문제마다:

현재 코드
→ 문제
→ 공격 시나리오
→ 위험성
→ 개선 방법

순서로 작성해줘.

실제로 문제가 발견되면 수정하지 말고 먼저 목록으로 보여줘.

## 학습 기록 업데이트

이번 단계의 작업이 완료되면 반드시 `docs/ai-development-log.md`를 업데이트한다.

다음 내용을 기록한다.

1. 이번 단계에서 내가 확인해야 했던 핵심 질문
2. 해당 질문에 대한 핵심 이론
3. 이번 프로젝트에서 선택한 설계
4. 해당 설계를 선택한 이유
5. 실제로 내가 Cursor에게 전달한 명령
6. Cursor가 실제로 변경한 파일과 구현 내용
7. 테스트 및 검증 결과
8. 발견된 문제와 해결 방법
9. 보안상 고려한 사항
10. 네트워크 관점에서 고려한 사항
11. 설계를 설명할 때 점검할 질문
12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

특히 "Cursor에게 전달한 명령"은 실제 명령을 요약하지 말고 원문 그대로 기록한다.

설계가 변경된 경우:

기존 설계
→ 변경 이유
→ 새로운 설계

형태로 기록한다.

기록을 작성한 후 실제 파일을 저장하고,
마지막 응답에서 기록 파일이 업데이트되었음을 알려줘.
```

### 6. Cursor 구현 결과

* 코드 수정 없음 (감사만)
* 채팅 응답에 문제 목록(현재코드→문제→시나리오→위험→개선) 정리

### 7. 테스트 및 검증 결과

* 정적 코드 리뷰 기준 감사 완료
* IDOR/BOLA: `assertResourceOwner`로 서버 측 차단 확인 (문제 아님)
* SQL: 파라미터 바인딩 확인 (문제 아님)
* localStorage 민감정보: 미사용 확인

### 8. 발견된 문제와 해결 방법

* 해결(수정)은 하지 않음. 잔존 이슈: 약한 JWT_SECRET/DB 비번, CSRF 토큰 부재, Swagger 상시 공개, Console 메일 토큰 로그, rate limit 부재, logout 미구현, 이메일 열거(409), 보안 헤더 부재 등 → 다음 패치 STEP에서 우선순위 적용 예정

### 9. 보안상 고려한 사항

* AuthN/AuthZ/Input/Browser/FE/BE 전 영역 체크리스트 적용
* “학습용 설정”이 운영에 그대로 가면 고위험이 됨을 명시

### 10. 네트워크 관점에서 고려한 사항

* CORS credentials + 단일 origin
* Cookie SameSite=Lax의 CSRF 완화 한계
* DB 포트 호스트 노출(5433)

### 11. 설계를 설명할 때 점검할 질문

* SameSite만으로 CSRF가 충분한가?
* Frontend Guard를 우회하면?
* JWT_SECRET이 약하면?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 감사 산출물 형식과 잔존 위험
* 서버 인가 vs 클라이언트 UX
* 설정(비밀·Secure·Swagger) 운영 리스크

---

## STEP 25 - Docker 풀스택 구성

> 과제 선택 항목인 Docker를, DB만이 아니라 frontend·backend까지 동일 Compose로 기동할 수 있게 한 단계.

### 1. 학습 질문

* 로컬 `npm run dev`와 Docker Compose를 병행할 때 포트·환경변수는 어떻게 맞춰야 하는가?
* Backend 컨테이너가 DB보다 먼저 뜨면 무엇이 깨지는가? healthcheck·depends_on의 역할은?
* Next.js를 컨테이너에 넣을 때 `standalone` 출력이 필요한 이유는?
* 브라우저가 보는 API URL(`NEXT_PUBLIC_*`)과 컨테이너 내부 `DATABASE_URL`의 호스트명이 다른 이유는?

### 2. 학습한 이론

* Compose는 서비스별 이미지·네트워크·볼륨을 선언하고, 서비스 이름은 DNS 호스트가 된다 (`db`, `backend`).
* 브라우저는 호스트에 publish된 포트만 알고, 컨테이너끼리의 `localhost`는 서로 다른 네트워크 네임스페이스다.
* 멀티스테이지 빌드로 런타임 이미지를 얇게 유지하고, 시크릿은 이미지에 넣지 않고 env로 주입한다.
* 마이그레이션은 앱 기동 전(또는 entrypoint)에 적용해야 스키마와 코드가 맞는다.

### 3. 설계 판단

* `docker/docker-compose.yml`: `db` + `backend` + `frontend`
* Backend: TypeScript 빌드 후 `node dist/db/migrate.js && node dist/index.js`
* Frontend: Next `output: "standalone"` + multi-stage Dockerfile
* 로컬 편의로 DB를 호스트 `5433`에 노출 (운영에서는 비공개 권장)
* env 예시: `docker/.env.example` (메일·JWT·Cookie 포함)

### 4. 설계 이유

* 선택하지 않은 대안: 로컬 npm만 — 환경 재현·배포 학습이 약함 / K8s — 과제 범위 대비 과도
* DB만 Compose이던 상태를 fe/be까지 확장해 “한 명령으로 전체 기동”을 목표로 함
* `depends_on` + Postgres healthcheck로 기동 레이스를 줄임

### 5. Cursor에게 전달한 명령

```text
# STEP 25 - Docker 풀스택 구성

과제 선택 항목인 Docker를 완성한다.
현재 DB만 Compose에 있는 상태를 frontend·backend까지 포함한 풀스택으로 만든다.

요구사항

* backend/Dockerfile, frontend/Dockerfile 추가
* docker-compose에 db + backend + frontend
* backend는 DB healthy 이후 마이그레이션 실행 후 API 기동
* frontend는 프로덕션 빌드(가능하면 Next standalone)로 컨테이너 실행
* 환경변수는 .env.example로 문서화 (실비밀값 커밋 금지)
* CORS / FRONTEND_ORIGIN / NEXT_PUBLIC_API_BASE_URL이 로컬 Docker에서 맞도록 설정
* backend는 0.0.0.0 에서 listen

구현 후 compose up --build 로 health·프론트·API가 응답하는지 검증한다.
설계 문서(network-flow / architecture)에 Compose 토폴로지를 반영할 수 있게 변경점을 정리한다.
```

### 6. Cursor 구현 결과

* `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/next.config.ts` (`standalone`)
* `docker/docker-compose.yml`, `docker/.env.example`
* backend `listen(port, "0.0.0.0")`

### 7. 테스트 및 검증 결과

* `docker compose up -d --build` 후 Frontend 3000 / Backend health `database: up` / Swagger 접근 확인

### 8. 발견된 문제와 해결 방법

* production Compose에서는 가입 응답에 개발용 인증 토큰이 없을 수 있음 → 메일 transport·로그로 인증 흐름 확인
* 로컬 npm과 Docker 포트 충돌 시 한쪽만 기동

### 9. 보안상 고려한 사항

* 이미지·compose에 JWT_SECRET·DB 비밀번호 하드코딩 금지
* DB 호스트 포트 노출은 학습용; 운영 체크리스트에 “DB 비공개” 명시

### 10. 네트워크 관점에서 고려한 사항

* 브라우저 → 호스트:3000/4000, backend → `db:5432`
* `NEXT_PUBLIC_API_BASE_URL`은 브라우저 기준 URL이어야 함 (컨테이너 내부 호스트명 아님)

### 11. 설계를 설명할 때 점검할 질문

* 왜 backend의 DATABASE_URL 호스트가 localhost가 아닌가?
* healthcheck 없이 depends_on만 쓰면 무엇이 실패할 수 있는가?
* standalone이 없으면 Docker 이미지가 어떻게 달라지는가?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* Compose 네트워크 DNS, publish vs expose
* 빌드 타임 env(Next public) vs 런타임 env(API)
* 마이그레이션과 앱 기동 순서

---

## STEP 26 - 개인/팀 블로그 공간 · 초대 · 공유 URL

> 단일 게시판을 “블로그(공간)” 단위로 재구성하고, 팀 비공개·초대·공유 주소·홈 피드·UI 제품화를 맞춘 단계.

### 1. 학습 질문

* 글이 “사용자”에만 묶일 때와 “블로그 공간”에 묶일 때 인가 모델은 어떻게 달라지는가?
* 팀 목록은 공개하되 본문은 멤버만 보게 하려면 API와 UI를 어떻게 나누는가?
* 초대코드를 DB에 원문으로 저장하면 안 되는 이유는? 일회용·TTL은 어디서 강제하는가?
* 공유 URL을 `/posts/{id}`만으로 두면 무엇이 부족한가? nickname과 urlSlug를 나누는 이유는?
* 트렌딩(인기글)에 팀 글을 넣지 않는 정책은 보안·제품 중 어디에 해당하는가?

### 2. 학습한 이론

* 리소스 계층: Blog → Post → Comment. 권한은 공간(멤버십)과 소유권(작성자)을 함께 본다.
* 초대 토큰은 해시 저장·1회 사용·만료로 재사용·유출 피해를 줄인다.
* “잠금 UI(블러)”는 UX이고, 본문 API는 서버에서 멤버십 검사로 막아야 한다.
* 표시명(한글 가능)과 URL 세그먼트(ASCII)를 분리하면 인코딩·가독성·예약어 충돌을 다루기 쉽다.
* 피드 집계(조회수·댓글수·기간)는 서버 쿼리로 하고, 클라이언트는 정렬·페이지만 요청한다.

### 3. 설계 판단

* `blogs` / `blog_members` / `blog_invite_codes` 마이그레이션
* personal: 공개 읽기, 작성은 소유(멤버)
* team: 목록·메타 공개, 본문·글은 멤버만; 초대 성공 시 영구 멤버
* 팀 생성: 유저당 rolling 7일 1회; 초대 24h TTL
* 공유: 개인 `/{urlSlug}/...`, 팀 `/{teamSlug}/...` + `GET /blogs/resolve`
* 홈: 당월 인기 개인 글 + 인기 팀; 조회순/댓글순
* UI: Velog 톤 디자인 토큰, 개인/팀 탭, 잠금 모달, 404 페이지

### 4. 설계 이유

* 선택하지 않은 대안: 팀도 전체 공개 — 과제에서 원한 “초대 입장”과 불일치
* 초대 남발 방지와 UX(복수 미사용 코드) 사이에서 TTL·해시·사용 처리를 서버에 둠
* nickname=URL 단일화는 한글·예약 경로와 충돌 → urlSlug 분리
* 프론트만 블러하면 IDOR로 본문 유출 가능 → API 인가가 본계약

### 5. Cursor에게 전달한 명령

```text
# STEP 26 - 개인/팀 블로그 공간 + 초대코드 + 공유 URL

게시글을 개인/팀 블로그(공간) 하위로 옮긴다.

확정 규칙

* 블로그 = 공간. 글은 반드시 한 블로그에 속함
* personal: 누구나 목록·글 조회 / 작성은 소유자(멤버)
* team: 목록(이름·타입·요약) 공개 / 입장·글 조회·작성은 멤버만
* 초대코드 사용 성공 → 영구 멤버 (재입장 시 코드 불필요)
* 초대코드는 일회용 + 서버에서 해시 저장 + 만료(TTL)
* 팀 블로그 생성은 유저당 주 1회(rolling 7일)
* 가입/인증 완료 시 개인 블로그 1개 자동 생성
* 기존 posts는 작성자 개인 블로그에 귀속 마이그레이션

공유 URL

* 개인: urlSlug(또는 소유자 주소) + 블로그/글 경로
* 팀: 팀 slug + 글 경로
* 팀 비멤버는 들어가되 본문 잠금(블러) + 로그인/가입·초대 유도. 서버도 본문 차단

홈(트렌딩)

* 진입은 로그인 불필요
* 인기 개인 글(조회/댓글 정렬) + 인기 팀
* 팀 비공개 본문이 트렌딩으로 새지 않게

Frontend는 기존 Velog 톤·디자인 토큰을 유지하며 개인/팀 탭·잠금 UI를 맞춘다.
OpenAPI·security·architecture에 블로그 인가를 반영한다.
```

### 6. Cursor 구현 결과

* 마이그레이션 `003`~`012` 일부(블로그·조회수·트렌딩·닉네임·slug·초대 정책 등)
* `blog.service` / routes / resolve / feed
* Frontend: HomeFeed, BlogDetail, SharedBlog/Post 경로, NotFoundView, 모달 톤 통일

### 7. 테스트 및 검증 결과

* 개인 글 공개 조회, 팀 비멤버 잠금, 초대 가입 후 본문 접근
* resolve·공유 경로, 404, 트렌딩 정렬·모바일 펼치기(페이지 단위)

### 8. 발견된 문제와 해결 방법

* `/posts/{id}`만으로는 공유 맥락이 약함 → vanity path + resolve
* 닉네임 한글 vs URL → nickname / urlSlug 분리 (STEP 28에서 가입 UX까지 정리)
* 초대 “미사용 1개” 정책을 이후 복수 미사용 허용으로 완화 (TTL·일회용은 유지)

### 9. 보안상 고려한 사항

* 초대 원문 1회 표시, DB는 해시
* 팀 본문·글 API에 멤버십 검사
* 조회수 IP 단위 완화(남용 완전 방지 아님)

### 10. 네트워크 관점에서 고려한 사항

* 공유 링크는 배포 도메인이 있어야 외부 공유가 성립 (로컬은 학습용)
* optionalAuth로 목록의 `isMember`만 보강, 본문은 여전히 서버 강제

### 11. 설계를 설명할 때 점검할 질문

* 팀 글 ID를 알아도 비멤버가 본문을 읽을 수 있는가?
* 초대코드를 DB에서 탈취하면 바로 쓸 수 있는가?
* 왜 표시 닉네임과 URL id를 나눴는가?
* 프론트 블러만으로 팀 보안이 되는가?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 공간 멤버십 vs 리소스 소유권
* 초대 토큰 수명·해시·1회성
* 공개 메타와 비공개 본문의 API 경계
* vanity URL과 reserved path

---

## STEP 27 - Refresh Token · Cookie 운영 강화

> STEP 24 보안 감사 잔여 중, 세션 수명과 운영 Cookie 설정을 먼저 보강한 단계.

### 1. 학습 질문

* Access Token만 길게 쓰는 것과 Refresh를 두는 것의 위협 모델 차이는?
* Refresh 로테이션이란 무엇이며, 폐기된 refresh를 다시 쓰면 왜 위험한가?
* `COOKIE_SECURE`를 production에서 강제하지 않으면 어떤 사고가 나는가?
* SameSite=Lax만으로 CSRF가 충분한가? (이번 STEP에서 토큰을 도입하지 않은 이유와 잔여 위험)

### 2. 학습한 이론

* Access는 짧게, Refresh는 길게 + 서버 저장(해시)으로 탈취 창을 줄인다.
* 로테이션: 사용 시 새 refresh 발급·이전 값 폐기. 폐기분 재사용은 탈취 신호로 보고 해당 사용자 세션을 전면 폐기할 수 있다.
* Secure=false인 Cookie는 HTTP에서도 전송되어 중간자·오픈 Wi-Fi에 노출된다.
* SameSite는 기본 완화일 뿐, 상태 변경 API의 CSRF 토큰은 별층이다.

### 3. 설계 판단

* `refresh_tokens` 테이블, 로그인 시 access+refresh Set-Cookie
* `POST /auth/refresh` 로테이션, `POST /auth/logout` 시 revoke
* reuse 탐지 시 `revokeAllForUser`
* production: `COOKIE_SECURE=true` 미설정 시 기동 거부; SameSite=None이면 Secure 필수
* env 예시·production example 정리

### 4. 설계 이유

* STEP 24에서 지적한 “짧은 access + 운영 Secure”를 코드로 고정
* CSRF 토큰·rate limit은 범위가 커 다음으로 남기고, 세션·Cookie부터 닫음
* refresh 원문을 body에 넣지 않고 Cookie만 사용 (XSS로 JS 탈취 완화와 일관)

### 5. Cursor에게 전달한 명령

```text
# STEP 27 - Refresh Token과 Cookie 운영 강화

STEP 24 보안 감사 후속이다. 이번에는 세션과 Cookie 운영만 다룬다.

구현 목표

1) Refresh Token
* access는 짧은 TTL 유지
* refresh는 HttpOnly Cookie + DB 해시 저장
* /auth/refresh 에서 로테이션
* 이미 폐기된 refresh가 다시 제시되면 해당 유저의 refresh를 모두 폐기하고 401
* /auth/logout 에서 refresh 폐기 및 쿠키 삭제

2) Cookie 운영
* production에서 COOKIE_SECURE=true 필수 (아니면 서버 기동 실패)
* SameSite=None 이면 Secure 필수 검증
* .env.example / production example / docker env 주석에 HTTPS 전제 체크리스트 반영

OpenAPI에 /auth/refresh·logout 동작과 보안 설명을 맞춘다.
CSRF 토큰·rate limit은 이번 범위에서 구현하지 말고 security.md 잔여로 남긴다.
```

### 6. Cursor 구현 결과

* migration `011_refresh_tokens.sql`
* `refreshToken.repository`, auth.service 로테이션·reuse 처리
* `authCookie` / `env` production 검증
* OpenAPI auth 경로 갱신

### 7. 테스트 및 검증 결과

* 로그인 → me → refresh → 새 쿠키
* 폐기 refresh 재사용 시 세션 무효화 동작 확인
* production 설정 누락 시 기동 실패 경로 확인

### 8. 발견된 문제와 해결 방법

* access만으로는 TTL·탈취 창이 큼 → refresh 분리
* 배포 전 Secure 미설정 실수 → 기동 시 hard fail

### 9. 보안상 고려한 사항

* refresh 해시 저장, 로테이션, reuse = 전면 로그아웃
* JWT/refresh 원문 JSON 미포함
* CSRF·rate limit은 여전히 잔여 (명시)

### 10. 네트워크 관점에서 고려한 사항

* cross-origin + credentials 유지; Secure는 HTTPS 전제
* 로컬 HTTP는 Secure=false 허용

### 11. 설계를 설명할 때 점검할 질문

* refresh를 탈취당한 뒤 정당한 클라이언트가 쓰면 무슨 일이 일어나는가?
* 왜 production에서 COOKIE_SECURE를 경고가 아니라 실패로 막았는가?
* access만 훔친 경우와 refresh까지 훔친 경우의 차이는?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* 로테이션과 reuse detection
* Cookie 플래그와 전송 조건
* 잔여 CSRF 표면과 다음 개선 후보

---

## STEP 28 - 실메일(Resend) · URL slug · API·문서 정리

> 이메일 인증을 실발송 가능하게 바꾸고, 가입 UX(urlSlug)·Swagger·학습 문서를 현재 구현에 맞춘 단계. 클라우드 실배포는 체크리스트만.

### 1. 학습 질문

* console 메일과 실발송을 같은 코드 경로에서 바꾸려면 어떤 추상화가 필요한가?
* 인증 링크에 토큰을 넣는 방식의 위험과 완화(만료·1회성·HTTPS)는?
* 표시용 닉네임(한글)과 주소용 slug(영문·숫자)를 가입 폼에서 어떻게 안내·검증하는가?
* OpenAPI를 “구현의 정본”으로 둘 때 markdown api-spec은 어디까지 쓰고, 한글화는 무엇을 목표로 하는가?
* README/docs는 실행 안내만으로 충분한가? 선택·대안·이유를 남기는 이유는?

### 2. 학습한 이론

* EmailSender 인터페이스로 transport를 갈아끼우면 도메인 로직(토큰 발급·검증)은 그대로 둔다.
* 운영에서 API 키·발신 도메인은 시크릿/DNS 검증이 필요하고, 키는 저장소에 커밋하지 않는다.
* `devVerificationToken`은 console 등 개발 transport에만 노출해야 실메일 환경과 혼동되지 않는다.
* 문서: 과정(log)과 현재 진실(architecture 등)을 분리하면 “왜”와 “지금”을 각각 설명할 수 있다.
* Swagger 커버리지 스크립트로 path 누락을 기계적으로 잡는다.

### 3. 설계 판단

* `EMAIL_TRANSPORT=console|resend`, production은 resend 강제
* Resend SDK 발송, 로컬은 console 로그
* nickname: 한글·영문 표시 / urlSlug: 선택 입력, `^[a-z][a-z0-9]{1,19}$`, 미입력 시 영문 닉 재사용 또는 `user{id}`
* OpenAPI 한글 summary/description, urlSlug 패턴·dev 토큰 설명 정합
* 루트 README + architecture/api-spec/security/network-flow 동기화
* 클라우드: HTTPS·Secure·Resend·ORIGIN 체크리스트만 (`network-flow.md`)

### 4. 설계 이유

* SMTP 직접 구축보다 Resend가 학습·실연동 비용이 낮고 transport 교체 연습에 적합
* slug에 한글을 넣으면 인코딩·카피·예약 충돌이 커짐 → 표시와 주소 분리
* api-spec 전량 복제는 불일치 원인 → Swagger 위임 + 목록 요약
* 실클라우드는 계정·도메인 준비가 필요해 Docker·문서 다음 단계로 분리

### 5. Cursor에게 전달한 명령

```text
# STEP 28 - 실메일(Resend) · urlSlug · Swagger/문서

1) 이메일
* EmailSender에 Resend 구현 추가
* EMAIL_TRANSPORT=console|resend
* production에서는 resend 필수
* console일 때만 개발용 인증 토큰 노출 가능
* 인증 완료 후 로그인 페이지로 안내(UX)

2) 가입 URL
* 닉네임(표시, 한글 가능)과 urlSlug(주소, 영문·숫자) 분리
* urlSlug는 선택; 미입력 시 규칙에 따라 자동 발급
* 프론트에서 slug 한글 입력 차단 및 안내 문구

3) Swagger
* 라우트 커버리지가 구현과 일치하는지 검증
* urlSlug 패턴·메일 토큰 설명을 구현에 맞게 수정
* summary/description 한글화

4) README / docs
* 루트 README: 목표, 스택 선택·대안·이유, 문서 지도, 실행/Docker
* architecture / api-spec / security / network-flow를 현재 구현에 맞게 갱신
* 과정과 현재 설계를 섞지 말 것
* 클라우드 실배포는 하지 말고 체크리스트만 network-flow에 둔다

비밀키·API 키 실값은 문서/로그에 적지 말 것.
```

### 6. Cursor 구현 결과

* `emailSender.ts` Resend, `env.ts` transport 검증
* users.`url_slug`, RegisterForm slug UX, 404·인증 완료 리다이렉트
* `openapi.ts` 한글화·정합, verifySwaggerCoverage match
* `README.md`, docs 4종 동기화

### 7. 테스트 및 검증 결과

* Resend 경로로 인증 메일 수신·토큰 검증·로그인까지 확인
* Swagger documented ≡ implemented
* 문서와 코드의 쿠키·블로그·메일 설명이 일치

### 8. 발견된 문제와 해결 방법

* 키를 채팅에 붙여 넣은 실수 → `.env`(gitignore)만 사용, 문서에는 예시만, 노출 시 로테이션 필요
* OpenAPI urlSlug에 `_`가 남아 있던 불일치 → 구현 패턴에 맞춤
* 인증 후 대기 UX → 짧은 안내 애니메이션 후 `/login`

### 9. 보안상 고려한 사항

* API 키 비커밋, production resend 강제
* 인증 토큰 만료·1회성, 링크는 HTTPS 전제(운영)
* Swagger 상시 공개는 운영에서 재검토 (기존 잔여)

### 10. 네트워크 관점에서 고려한 사항

* Backend → Resend(HTTPS), Browser → Frontend → API
* 배포 시 FRONTEND_ORIGIN / PUBLIC API URL / Secure Cookie 정렬

### 11. 설계를 설명할 때 점검할 질문

* 왜 메일을 console/resend로 나눴는가?
* urlSlug를 닉네임과 같게 두지 않은 이유는?
* api-spec에 모든 필드를 복사하지 않은 이유는?
* 클라우드 배포 전에 반드시 맞춰야 할 환경 변수는?

### 12. 해당 질문에 답하기 위해 내가 이해해야 할 핵심 내용

* transport 추상화와 시크릿 관리
* 표시명 vs URL 식별자
* OpenAPI를 계약 정본으로 두는 운영
* 과정 로그 vs 설계 문서의 역할 분리
* 배포 체크리스트(HTTPS, Cookie, CORS, 메일)
