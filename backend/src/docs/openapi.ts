/**
 * OpenAPI 3.0 스펙 — 실제 Express 라우트와 동기화 유지.
 * Swagger UI: GET /api/docs
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "TEAM API",
    version: "1.0.0",
    description:
      "JWT HttpOnly 쿠키 인증 REST API. 로그인 후 access_token 쿠키가 저장되면 Authorize(cookie)로 보호 API를 호출할 수 있습니다. refresh_token으로 재발급(/auth/refresh) 가능.",
  },
  servers: [{ url: "/api", description: "API 기본 경로" }],
  tags: [
    { name: "Health", description: "서버 상태" },
    { name: "Auth", description: "회원가입 · 로그인 · 토큰" },
    { name: "Feed", description: "홈 피드(트렌딩)" },
    { name: "Blogs", description: "개인/팀 블로그" },
    { name: "Posts", description: "글" },
    { name: "Comments", description: "댓글" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
        description:
          "로그인(POST /auth/login) 성공 시 Set-Cookie로 발급되는 HttpOnly access JWT. refresh_token 쿠키로 /auth/refresh에서 재발급할 수 있습니다.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {},
            },
            required: ["code", "message"],
          },
        },
        required: ["error"],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          nickname: { type: "string", description: "표시용 닉네임" },
          urlSlug: { type: "string", description: "블로그 주소용 영문 ID" },
          emailVerified: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Post: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          blogId: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          viewCount: { type: "integer" },
          commentCount: { type: "integer" },
          trendingVisible: {
            type: "boolean",
            description: "개인 블로그 글의 트렌딩 노출 여부",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Blog: {
        type: "object",
        properties: {
          id: { type: "string" },
          ownerId: { type: "string" },
          type: { type: "string", enum: ["personal", "team"] },
          name: { type: "string" },
          slug: { type: "string", description: "블로그 슬러그" },
          description: { type: "string" },
          ownerNickname: { type: "string", nullable: true },
          ownerUrlSlug: {
            type: "string",
            nullable: true,
            description: "소유자 주소용 영문 ID",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          isMember: { type: "boolean", description: "로그인 시 멤버 여부" },
          memberCount: { type: "integer" },
          role: {
            type: "string",
            nullable: true,
            enum: ["owner", "member", null],
            description: "내 역할 (비멤버면 null)",
          },
        },
      },
      CreateBlogRequest: {
        type: "object",
        required: ["type", "name"],
        properties: {
          type: { type: "string", enum: ["personal", "team"] },
          name: { type: "string", maxLength: 100 },
          description: {
            type: "string",
            maxLength: 1000,
            description: "팀 블로그는 필수",
          },
        },
      },
      UpdateBlogRequest: {
        type: "object",
        properties: {
          name: { type: "string", maxLength: 100 },
          description: { type: "string", minLength: 1, maxLength: 1000 },
        },
        description: "name 또는 description 중 하나 이상 필요",
      },
      TeamCreateStatus: {
        type: "object",
        properties: {
          hasCreated: { type: "boolean" },
          lastCreatedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          canCreate: { type: "boolean" },
          nextAvailableAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },
      JoinBlogRequest: {
        type: "object",
        required: ["code"],
        properties: {
          code: { type: "string" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "string" },
          postId: { type: "string" },
          userId: { type: "string" },
          nickname: { type: "string", nullable: true },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "nickname"],
        properties: {
          email: { type: "string", format: "email" },
          password: {
            type: "string",
            minLength: 8,
            maxLength: 72,
            description: "영문과 숫자를 각각 1자 이상 포함",
          },
          nickname: {
            type: "string",
            minLength: 2,
            maxLength: 20,
            pattern: "^[a-z가-힣][a-z0-9가-힣_]{1,19}$",
            description:
              "표시용 닉네임. 2–20자, 한글/영문으로 시작, 한글·영문·숫자·_",
          },
          urlSlug: {
            type: "string",
            minLength: 2,
            maxLength: 20,
            pattern: "^[a-z][a-z0-9]{1,19}$",
            description:
              "선택. 블로그 주소용 영문 ID. 미입력 시 영문 닉네임 재사용 또는 user{id} 자동 발급",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      VerifyEmailRequest: {
        type: "object",
        required: ["token"],
        properties: {
          token: { type: "string" },
        },
      },
      PostWriteRequest: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: { type: "string", maxLength: 200 },
          content: { type: "string", maxLength: 20000 },
          trendingVisible: {
            type: "boolean",
            description:
              "개인 블로그만. 트렌딩(인기글) 노출 여부. 팀 글에서는 무시",
            default: false,
          },
        },
      },
      CommentWriteRequest: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", maxLength: 5000 },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "잘못된 요청 / 유효성 검사 실패",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Unauthorized: {
        description: "인증 필요 또는 토큰 무효/만료",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Forbidden: {
        description: "인증됨이나 권한 없음(소유권 등)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "리소스를 찾을 수 없음",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Conflict: {
        description: "충돌 (예: 이메일/닉네임/주소 ID 중복)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "헬스 체크",
        security: [],
        responses: {
          "200": {
            description: "정상 (DB 연결됨)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "ok" },
                        uptime: { type: "number" },
                        database: { type: "string", example: "up" },
                      },
                    },
                  },
                },
              },
            },
          },
          "503": {
            description: "장애 (DB 연결 실패)",
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "회원가입",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "생성됨(emailVerified=false). EMAIL_TRANSPORT=console 일 때만 응답에 devVerificationToken 포함",
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/auth/verify-email": {
      post: {
        tags: ["Auth"],
        summary: "이메일 인증 토큰 검증",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyEmailRequest" },
            },
          },
        },
        responses: {
          "200": { description: "이메일 인증 완료" },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "로그인 (HttpOnly access_token + refresh_token 쿠키 발급)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description:
              "성공. Set-Cookie: access_token + refresh_token (HttpOnly)",
            headers: {
              "Set-Cookie": {
                schema: { type: "string" },
                description: "access_token, refresh_token 쿠키",
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary:
          "refresh 로테이션 및 access 재발급. 폐기된 refresh 재사용 시 해당 유저 세션 전부 폐기",
        security: [],
        responses: {
          "200": {
            description:
              "성공. 새 access_token + refresh_token 쿠키 (로테이션)",
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "로그아웃 (refresh 폐기 · 인증 쿠키 삭제)",
        security: [],
        responses: {
          "200": { description: "로그아웃 완료" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "현재 로그인 사용자",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "현재 사용자 정보" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/feed/home": {
      get: {
        tags: ["Feed"],
        summary:
          "홈 피드: 이번 달 인기 개인 글 + 인기 팀",
        security: [],
        parameters: [
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["views", "comments"],
              default: "views",
            },
            description: "당월 인기글 정렬: 조회순(기본) / 댓글순",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "인기글 페이지 (펼치기/더보기용)",
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 50,
              default: 9,
            },
            description: "인기글 페이지당 개수",
          },
        ],
        responses: {
          "200": {
            description:
              "인기 개인 글·인기 팀 목록과 sort, period, popularPostsPagination",
          },
        },
      },
    },
    "/blogs": {
      get: {
        tags: ["Blogs"],
        summary: "블로그 목록 (공개 메타, 로그인 시 isMember 포함)",
        security: [],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["personal", "team"] },
            description:
              "유형 필터. personal은 내 개인 블로그만(로그인 필요). team은 공개 팀 목록",
          },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "members_desc",
                "members_asc",
                "created_desc",
                "created_asc",
              ],
              default: "members_desc",
            },
            description:
              "팀 목록 정렬. type=team일 때 기본 members_desc",
          },
        ],
        responses: {
          "200": { description: "페이지네이션된 블로그 목록" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Blogs"],
        summary: "블로그 생성 (팀은 주 1회 제한)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBlogRequest" },
            },
          },
        },
        responses: {
          "201": { description: "생성됨" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/blogs/me": {
      get: {
        tags: ["Blogs"],
        summary: "내 개인 블로그 조회",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "개인 블로그" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/blogs/team-create-status": {
      get: {
        tags: ["Blogs"],
        summary: "팀 생성 이력 및 주간 제한 상태",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "팀 생성 가능 여부" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/blogs/check-name": {
      get: {
        tags: ["Blogs"],
        summary: "팀 이름 중복 확인",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "name",
            in: "query",
            required: true,
            schema: { type: "string", maxLength: 100 },
          },
        ],
        responses: {
          "200": { description: "{ name, available } 반환" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/blogs/resolve": {
      get: {
        tags: ["Blogs"],
        summary: "공유 URL로 블로그 해석 (개인: urlSlug+slug / 팀: slug)",
        security: [],
        parameters: [
          {
            name: "kind",
            in: "query",
            required: true,
            schema: { type: "string", enum: ["personal", "team"] },
          },
          {
            name: "urlSlug",
            in: "query",
            schema: { type: "string" },
            description: "kind=personal일 때 필요 (권장)",
          },
          {
            name: "nickname",
            in: "query",
            schema: { type: "string" },
            description: "(폐기 예정) kind=personal일 때 urlSlug 별칭",
          },
          {
            name: "slug",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "블로그" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/blogs/{blogId}": {
      get: {
        tags: ["Blogs"],
        summary: "블로그 조회 (팀은 멤버만)",
        security: [],
        parameters: [
          {
            name: "blogId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "블로그" },
          "403": {
            description: "팀 블로그 잠금 (비멤버)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Blogs"],
        summary: "팀 소개/이름 수정 (소유자만)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "blogId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateBlogRequest" },
            },
          },
        },
        responses: {
          "200": { description: "수정된 블로그" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/blogs/{blogId}/meta": {
      get: {
        tags: ["Blogs"],
        summary: "블로그 공개 메타 (잠금 없음)",
        security: [],
        parameters: [
          {
            name: "blogId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "블로그 메타" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/blogs/{blogId}/join": {
      post: {
        tags: ["Blogs"],
        summary: "초대코드로 팀 가입",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "blogId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/JoinBlogRequest" },
            },
          },
        },
        responses: {
          "200": { description: "가입 완료" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/blogs/{blogId}/invites": {
      post: {
        tags: ["Blogs"],
        summary: "1회용 초대코드 발급 (소유자, 24시간, 미사용 복수 허용)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "blogId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "201": {
            description:
              "초대코드(원문, 1회 표시). expiresAt은 ISO 시각(24시간)",
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/blogs/{blogId}/posts": {
      get: {
        tags: ["Blogs"],
        summary: "블로그 글 목록 (팀은 멤버만)",
        security: [],
        parameters: [
          {
            name: "blogId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          "200": { description: "페이지네이션된 글 목록" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      post: {
        tags: ["Blogs"],
        summary: "블로그에 글 작성 (멤버만)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "blogId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostWriteRequest" },
            },
          },
        },
        responses: {
          "201": { description: "생성됨" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/posts": {
      get: {
        tags: ["Posts"],
        summary: "공개 개인 블로그 글 목록",
        security: [],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          "200": {
            description: "페이지네이션된 글 목록",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Post" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
      post: {
        tags: ["Posts"],
        summary: "글 작성 (내 개인 블로그)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostWriteRequest" },
            },
          },
        },
        responses: {
          "201": { description: "생성됨" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/posts/{id}": {
      get: {
        tags: ["Posts"],
        summary: "글 상세 조회",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "글" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Posts"],
        summary: "글 수정 (작성자만)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostWriteRequest" },
            },
          },
        },
        responses: {
          "200": { description: "수정됨" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "글 삭제 (작성자만)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "삭제됨" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/posts/{postId}/comments": {
      get: {
        tags: ["Comments"],
        summary: "댓글 목록",
        security: [],
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "댓글 목록" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      post: {
        tags: ["Comments"],
        summary: "댓글 작성",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentWriteRequest" },
            },
          },
        },
        responses: {
          "201": { description: "생성됨" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/comments/{commentId}": {
      put: {
        tags: ["Comments"],
        summary: "댓글 수정 (작성자만)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentWriteRequest" },
            },
          },
        },
        responses: {
          "200": { description: "수정된 댓글" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Comments"],
        summary: "댓글 삭제 (작성자만)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": { description: "삭제됨" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
} as const;

/** 스펙에 정의된 path+method 목록 (검증용) */
export function listOpenApiOperations(): string[] {
  const ops: string[] = [];
  const paths = openApiSpec.paths as Record<
    string,
    Record<string, unknown>
  >;
  for (const [path, methods] of Object.entries(paths)) {
    for (const method of Object.keys(methods)) {
      if (["get", "post", "put", "patch", "delete"].includes(method)) {
        ops.push(`${method.toUpperCase()} /api${path}`);
      }
    }
  }
  return ops.sort();
}
