import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "../docs/openapi";

/**
 * Swagger UI: /api/docs
 * OpenAPI JSON: /api/docs.json
 *
 * Cookie 인증 테스트:
 * 1) POST /auth/login Try it out → Set-Cookie 저장
 * 2) Authorize에서 cookieAuth 사용 (또는 동일 브라우저 세션의 쿠키 자동 전송)
 * 3) withCredentials로 보호 API 호출
 */
export function setupSwagger(app: Express): void {
  app.get("/api/docs.json", (_req, res) => {
    res.json(openApiSpec);
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        withCredentials: true,
      },
    }),
  );
}
