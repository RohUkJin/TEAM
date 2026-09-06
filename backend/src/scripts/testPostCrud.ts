import jwt from "jsonwebtoken";
import { env } from "../config/env";

const base = `http://localhost:${env.port}/api`;

async function json(
  method: string,
  path: string,
  options?: { token?: string; body?: unknown },
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options?.token) {
    headers.Cookie = `access_token=${options.token}`;
  }
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return { status: res.status, data };
}

async function signupLogin(email: string) {
  const reg = await json("POST", "/auth/register", {
    body: { email, password: "password123" },
  });
  const verifyToken = reg.data.data.devVerificationToken as string;
  await json("POST", "/auth/verify-email", { body: { token: verifyToken } });
  const loginRes = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" }),
  });
  const setCookie =
    loginRes.headers.getSetCookie?.()[0] ??
    loginRes.headers.get("set-cookie") ??
    "";
  return setCookie.split(";")[0].replace("access_token=", "");
}

async function main() {
  const ts = Date.now();
  const tokenA = await signupLogin(`posta_${ts}@example.com`);
  const tokenB = await signupLogin(`postb_${ts}@example.com`);

  const created = await json("POST", "/posts", {
    token: tokenA,
    body: { title: "CRUD post", content: "body" },
  });
  console.log("CREATE_OK", created.status);
  const postId = created.data.data.post.id as string;

  const list = await json("GET", "/posts?page=1&limit=10");
  console.log("LIST_OK", list.status, Array.isArray(list.data?.data));

  const detail = await json("GET", `/posts/${postId}`);
  console.log("DETAIL_OK", detail.status);

  console.log(
    "1_NO_AUTH_POST",
    (await json("POST", "/posts", { body: { title: "x", content: "y" } })).status,
  );

  console.log(
    "2_OTHER_PUT",
    (
      await json("PUT", `/posts/${postId}`, {
        token: tokenB,
        body: { title: "hack", content: "hack" },
      })
    ).status,
  );

  console.log(
    "3_OTHER_DELETE",
    (await json("DELETE", `/posts/${postId}`, { token: tokenB })).status,
  );

  console.log(
    "4_NOT_FOUND",
    (
      await json("PUT", "/posts/999999", {
        token: tokenA,
        body: { title: "x", content: "y" },
      })
    ).status,
  );

  console.log(
    "5_BAD_JWT",
    (
      await json("PUT", `/posts/${postId}`, {
        token: "a.b.c",
        body: { title: "x", content: "y" },
      })
    ).data?.error?.code,
  );

  const expired = jwt.sign({ userId: "1" }, env.jwtSecret, { expiresIn: -10 });
  console.log(
    "6_EXPIRED_JWT",
    (
      await json("PUT", `/posts/${postId}`, {
        token: expired,
        body: { title: "x", content: "y" },
      })
    ).data?.error?.code,
  );

  console.log(
    "7_BAD_BODY",
    (
      await json("POST", "/posts", {
        token: tokenA,
        body: { title: 123 },
      })
    ).status,
  );

  const ownerPut = await json("PUT", `/posts/${postId}`, {
    token: tokenA,
    body: { title: "updated", content: "ok" },
  });
  console.log("OWNER_PUT_OK", ownerPut.status);

  const ownerDel = await json("DELETE", `/posts/${postId}`, { token: tokenA });
  console.log("OWNER_DELETE_OK", ownerDel.status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
