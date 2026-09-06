"use client";

import { useAuthStore } from "@/stores";

/**
 * 로그인 상태 확인 UI — 새로고침 후 status/user 복구 여부를 눈으로 검증한다.
 */
export function AuthSessionPanel() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  return (
    <section
      style={{
        marginTop: "1.5rem",
        padding: "1rem",
        border: "1px solid #ccc",
        maxWidth: "32rem",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Auth session</h2>
      <p>
        status: <strong>{status}</strong>
      </p>
      {status === "loading" && <p>Checking session via GET /auth/me…</p>}
      {status === "authenticated" && user && (
        <p>
          user: {user.email} (id: {user.id})
        </p>
      )}
      {status === "unauthenticated" && (
        <p>Not signed in (no valid access_token cookie).</p>
      )}
      <p style={{ fontSize: "0.85rem", color: "#555" }}>
        JWT is HttpOnly — JS never reads the token. Refresh keeps login only if
        the cookie is still valid and /auth/me succeeds.
      </p>
    </section>
  );
}
