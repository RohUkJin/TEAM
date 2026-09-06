/**
 * Protected route / Backend authorization 검증
 *
 * 1–2) Frontend Route Guard: RequireAuth → /login?next= (브라우저에서 확인)
 * 3) 비로그인 POST /api/posts → 401
 * 4) 로그인 사용자 B가 A 글에 PUT → 403
 */
const API = process.env.API_BASE_URL ?? "http://localhost:4000/api";

function pickAccessCookie(res: Response): string {
  const anyHeaders = res.headers as Headers & { getSetCookie?: () => string[] };
  const list = anyHeaders.getSetCookie?.() ?? [];
  for (const c of list) {
    if (c.startsWith("access_token=")) return c.split(";")[0];
  }
  const raw = res.headers.get("set-cookie") ?? "";
  const m = raw.match(/access_token=([^;]+)/);
  if (!m) throw new Error("access_token cookie missing");
  return `access_token=${m[1]}`;
}

async function registerVerifyLogin(email: string, password: string) {
  const reg = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const regBody = await reg.json();
  const token = regBody?.data?.devVerificationToken as string | undefined;
  if (!token) throw new Error("devVerificationToken missing");

  await fetch(`${API}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const login = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!login.ok) throw new Error(`login failed ${login.status}`);
  return pickAccessCookie(login);
}

async function main() {
  const password = "password123";
  const emailA = `owner_${Date.now()}@example.com`;
  const emailB = `other_${Date.now()}@example.com`;

  console.log("=== Setup user A & B ===");
  const cookieA = await registerVerifyLogin(emailA, password);
  const cookieB = await registerVerifyLogin(emailB, password);

  console.log("=== 3) Unauthenticated POST /posts ===");
  const postNoAuth = await fetch(`${API}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "x", content: "y" }),
  });
  console.log("status", postNoAuth.status);
  if (postNoAuth.status !== 401) {
    throw new Error(`expected 401, got ${postNoAuth.status}`);
  }

  console.log("=== Create post as A ===");
  const created = await fetch(`${API}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieA,
    },
    body: JSON.stringify({ title: "A post", content: "owned by A" }),
  });
  const createdBody = await created.json();
  const postId = createdBody?.data?.post?.id as string | undefined;
  console.log("status", created.status, "postId", postId);
  if (!created.ok || !postId) throw new Error("create as A failed");

  console.log("=== 4) User B PUT /posts/:id (A's post) ===");
  const putB = await fetch(`${API}/posts/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieB,
    },
    body: JSON.stringify({ title: "hacked", content: "nope" }),
  });
  console.log("status", putB.status);
  if (putB.status !== 403) {
    throw new Error(`expected 403, got ${putB.status}`);
  }

  console.log("\n=== Frontend guard checklist (manual / browser) ===");
  console.log("1) logged out → /posts/write → redirect /login?next=/posts/write");
  console.log("2) logged in  → /posts/write → form visible");
  console.log("\nPASS: Backend cases 3 (401) and 4 (403)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
