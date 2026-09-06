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
  await json("POST", "/auth/verify-email", {
    body: { token: reg.data.data.devVerificationToken },
  });
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
  const tokenA = await signupLogin(`cmt_a_${ts}@example.com`);
  const tokenB = await signupLogin(`cmt_b_${ts}@example.com`);

  const post = await json("POST", "/posts", {
    token: tokenA,
    body: { title: "post for comments", content: "body" },
  });
  const postId = post.data.data.post.id as string;

  const created = await json("POST", `/posts/${postId}/comments`, {
    token: tokenA,
    body: { content: "hello" },
  });
  console.log("CREATE_COMMENT", created.status);
  const commentId = created.data.data.comment.id as string;

  const list = await json("GET", `/posts/${postId}/comments`);
  console.log("LIST_PUBLIC", list.status, list.data?.data?.comments?.length);

  console.log(
    "MISSING_POST",
    (
      await json("POST", "/posts/999999/comments", {
        token: tokenA,
        body: { content: "x" },
      })
    ).status,
  );

  console.log(
    "OTHER_DELETE",
    (await json("DELETE", `/comments/${commentId}`, { token: tokenB })).status,
  );

  console.log(
    "NO_AUTH_POST",
    (
      await json("POST", `/posts/${postId}/comments`, {
        body: { content: "x" },
      })
    ).status,
  );

  console.log(
    "BAD_JWT",
    (
      await json("DELETE", `/comments/${commentId}`, { token: "a.b.c" })
    ).data?.error?.code,
  );

  const expired = jwt.sign({ userId: "1" }, env.jwtSecret, { expiresIn: -10 });
  console.log(
    "EXPIRED_JWT",
    (
      await json("DELETE", `/comments/${commentId}`, { token: expired })
    ).data?.error?.code,
  );

  console.log(
    "OWNER_DELETE",
    (await json("DELETE", `/comments/${commentId}`, { token: tokenA })).status,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
