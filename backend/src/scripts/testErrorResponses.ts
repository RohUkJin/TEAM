/**
 * 에러 응답 shape / 민감정보 비노출 점검
 */
const API = process.env.API_BASE_URL ?? "http://localhost:4000/api";

async function bodyOf(res: Response) {
  return { status: res.status, json: await res.json().catch(() => null) };
}

function assertNoLeak(label: string, json: unknown) {
  const text = JSON.stringify(json ?? {});
  const banned = ["stack", "password", "JWT_SECRET", "DATABASE_URL", "at Object."];
  for (const b of banned) {
    if (text.toLowerCase().includes(b.toLowerCase()) && b !== "password") {
      // "password" may appear in validation field names — only fail on hash-like leaks
    }
    if (b === "stack" || b === "JWT_SECRET" || b === "DATABASE_URL" || b === "at Object.") {
      if (text.includes(b) || text.toLowerCase().includes("jwt_secret")) {
        throw new Error(`${label}: sensitive leak candidate: ${b}`);
      }
    }
  }
  if (/\$2[aby]\$/.test(text)) {
    throw new Error(`${label}: bcrypt hash leak`);
  }
}

async function main() {
  console.log("=== 400 validation ===");
  const v = await bodyOf(
    await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "bad", password: "" }),
    }),
  );
  console.log(v.status, v.json);
  assertNoLeak("validation", v.json);
  if (v.status !== 400) throw new Error("expected 400");

  console.log("=== 401 unauthorized ===");
  const u = await bodyOf(await fetch(`${API}/auth/me`));
  console.log(u.status, u.json);
  assertNoLeak("unauthorized", u.json);
  if (u.status !== 401) throw new Error("expected 401");

  console.log("=== 404 not found ===");
  const n = await bodyOf(await fetch(`${API}/posts/99999999`));
  console.log(n.status, n.json);
  assertNoLeak("notfound", n.json);
  if (n.status !== 404) throw new Error("expected 404");

  console.log("=== 409 conflict (register twice) ===");
  const email = `err_${Date.now()}@example.com`;
  const password = "password123";
  await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const c = await bodyOf(
    await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
  console.log(c.status, c.json);
  assertNoLeak("conflict", c.json);
  if (c.status !== 409) throw new Error("expected 409");

  console.log("\nPASS: error envelopes look clean");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
