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
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return { status: res.status, data };
}

async function signupLogin(email: string) {
  const reg = await json("POST", "/auth/register", {
    body: { email, password: "password123" },
  });
  const token = reg.data.data.devVerificationToken as string;
  await json("POST", "/auth/verify-email", { body: { token } });
  const loginRes = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" }),
  });
  const setCookie = loginRes.headers.getSetCookie?.()[0] ?? loginRes.headers.get("set-cookie") ?? "";
  const accessToken = setCookie.split(";")[0].replace("access_token=", "");
  return accessToken;
}

async function main() {
  const ts = Date.now();
  const tokenA = await signupLogin(`ownera3_${ts}@example.com`);
  const tokenB = await signupLogin(`ownerb3_${ts}@example.com`);

  const created = await json("POST", "/posts", {
    token: tokenA,
    body: { title: "A post", content: "owned by A" },
  });
  console.log("CREATE", created.status, JSON.stringify(created.data));
  const postId = created.data.data.post.id as string;

  const patchB = await json("PUT", `/posts/${postId}`, {
    token: tokenB,
    body: { title: "hacked", content: "stolen" },
  });
  console.log("B_PUT", patchB.status, patchB.data?.error?.code);

  const delB = await json("DELETE", `/posts/${postId}`, { token: tokenB });
  console.log("B_DELETE_POST", delB.status, delB.data?.error?.code);

  const comment = await json("POST", `/posts/${postId}/comments`, {
    token: tokenA,
    body: { content: "comment by A" },
  });
  console.log("COMMENT", comment.status, JSON.stringify(comment.data));
  const commentId = comment.data.data.comment.id as string;

  const delCommentB = await json("DELETE", `/comments/${commentId}`, {
    token: tokenB,
  });
  console.log("B_DELETE_COMMENT", delCommentB.status, delCommentB.data?.error?.code);

  const delCommentA = await json("DELETE", `/comments/${commentId}`, {
    token: tokenA,
  });
  console.log("A_DELETE_COMMENT", delCommentA.status);

  const patchA = await json("PUT", `/posts/${postId}`, {
    token: tokenA,
    body: { title: "updated", content: "by owner" },
  });
  console.log("A_PUT", patchA.status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
