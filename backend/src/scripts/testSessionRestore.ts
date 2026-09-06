/**
 * 새로고침 후 로그인 유지 시나리오 (Cookie = source of truth)
 *
 * 1) register → verify → login → Set-Cookie
 * 2) GET /auth/me with Cookie → authenticated (앱 로드)
 * 3) Zustand가 비워진 것과 동일하게 "새 세션"에서 다시 GET /auth/me
 *    → 같은 Cookie로 복구되는지 검증
 * 4) Cookie 없이 /auth/me → 401
 */
const API = process.env.API_BASE_URL ?? "http://localhost:4000/api";

function pickCookie(setCookie: string | null, name: string): string | null {
  if (!setCookie) return null;
  // Node fetch may join multiple Set-Cookie; take first matching pair
  const parts = setCookie.split(/,(?=\s*[^;]+=)/);
  for (const part of parts) {
    const match = part.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
    if (match) return `${name}=${match[1]}`;
    if (part.trim().startsWith(`${name}=`)) {
      return part.split(";")[0].trim();
    }
  }
  const simple = setCookie.match(new RegExp(`${name}=([^;]+)`));
  return simple ? `${name}=${simple[1]}` : null;
}

async function json(res: Response) {
  const data = await res.json().catch(() => null);
  return { status: res.status, data, setCookie: res.headers.get("set-cookie") };
}

async function main() {
  const email = `session_${Date.now()}@example.com`;
  const password = "password123";

  console.log("=== 1) register ===");
  const reg = await json(
    await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
  console.log("status", reg.status);
  const token = reg.data?.data?.devVerificationToken as string | undefined;
  if (!token) {
    throw new Error("devVerificationToken missing — need development NODE_ENV");
  }

  console.log("=== 2) verify-email ===");
  const ver = await json(
    await fetch(`${API}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }),
  );
  console.log("status", ver.status);

  console.log("=== 3) login (Set-Cookie) ===");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginBody = await loginRes.json();
  const cookieHeader =
    pickCookie(loginRes.headers.get("set-cookie"), "access_token") ??
    (() => {
      // undici may expose getSetCookie
      const anyHeaders = loginRes.headers as Headers & {
        getSetCookie?: () => string[];
      };
      const list = anyHeaders.getSetCookie?.() ?? [];
      for (const c of list) {
        if (c.startsWith("access_token=")) return c.split(";")[0];
      }
      return null;
    })();

  console.log("login status", loginRes.status);
  console.log("cookie present", Boolean(cookieHeader));
  if (!cookieHeader) {
    throw new Error("access_token cookie not returned");
  }

  console.log("=== 4) /auth/me (app start) ===");
  const me1 = await json(
    await fetch(`${API}/auth/me`, {
      headers: { Cookie: cookieHeader },
    }),
  );
  console.log("status", me1.status, "email", me1.data?.data?.user?.email);

  console.log("=== 5) simulate refresh: Zustand cleared, Cookie kept → /auth/me ===");
  const me2 = await json(
    await fetch(`${API}/auth/me`, {
      headers: { Cookie: cookieHeader },
    }),
  );
  console.log("status", me2.status, "email", me2.data?.data?.user?.email);

  console.log("=== 6) /auth/me without cookie ===");
  const me3 = await json(await fetch(`${API}/auth/me`));
  console.log("status", me3.status);

  const ok =
    me1.status === 200 &&
    me2.status === 200 &&
    me1.data?.data?.user?.email === email &&
    me2.data?.data?.user?.email === email &&
    me3.status === 401;

  if (!ok) {
    console.error("FAIL: session restore scenario");
    process.exit(1);
  }
  console.log("\nPASS: refresh keeps auth via Cookie + /auth/me");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
