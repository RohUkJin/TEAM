import { listOpenApiOperations } from "../docs/openapi";

/** 실제 Express에 구현된 API (문서 대조용 기준 목록) */
const implementedApis = [
  "GET /api/health",
  "POST /api/auth/register",
  "POST /api/auth/verify-email",
  "POST /api/auth/login",
  "POST /api/auth/refresh",
  "POST /api/auth/logout",
  "GET /api/auth/me",
  "GET /api/feed/home",
  "GET /api/blogs",
  "POST /api/blogs",
  "GET /api/blogs/me",
  "GET /api/blogs/team-create-status",
  "GET /api/blogs/check-name",
  "GET /api/blogs/resolve",
  "GET /api/blogs/{blogId}",
  "PATCH /api/blogs/{blogId}",
  "GET /api/blogs/{blogId}/meta",
  "POST /api/blogs/{blogId}/join",
  "POST /api/blogs/{blogId}/invites",
  "GET /api/blogs/{blogId}/posts",
  "POST /api/blogs/{blogId}/posts",
  "GET /api/posts",
  "POST /api/posts",
  "GET /api/posts/{id}",
  "PUT /api/posts/{id}",
  "DELETE /api/posts/{id}",
  "GET /api/posts/{postId}/comments",
  "POST /api/posts/{postId}/comments",
  "PUT /api/comments/{commentId}",
  "DELETE /api/comments/{commentId}",
].sort();

function normalize(op: string): string {
  return op.replace(/:([A-Za-z]+)/g, "{$1}");
}

async function main() {
  const documented = listOpenApiOperations().map(normalize).sort();
  const impl = implementedApis.map(normalize).sort();

  const missingInDocs = impl.filter((x) => !documented.includes(x));
  const extraInDocs = documented.filter((x) => !impl.includes(x));

  console.log("=== Documented ===");
  for (const op of documented) console.log(op);

  console.log("\n=== Implemented (baseline) ===");
  for (const op of impl) console.log(op);

  console.log("\n=== Missing in Swagger ===");
  console.log(missingInDocs.length ? missingInDocs.join("\n") : "(none)");

  console.log("\n=== Extra in Swagger ===");
  console.log(extraInDocs.length ? extraInDocs.join("\n") : "(none)");

  const res = await fetch(`http://localhost:4000/api/docs.json`);
  console.log("\n=== /api/docs.json ===", res.status);
  const spec = (await res.json()) as { paths: Record<string, unknown> };
  console.log("paths count:", Object.keys(spec.paths).length);

  if (missingInDocs.length || extraInDocs.length) {
    process.exit(1);
  }
  console.log("\nSwagger and implementation match.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
