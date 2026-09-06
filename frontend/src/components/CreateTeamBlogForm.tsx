"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TeamCreateStatus } from "@/lib/api";
import { formatDate, getErrorMessage } from "@/lib/ui";
import { blogHref } from "@/lib/paths";
import { blogsService } from "@/services";
import styles from "@/app/board.module.css";

type NameCheck = "idle" | "checking" | "available" | "taken";

export function CreateTeamBlogForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TeamCreateStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [nameCheck, setNameCheck] = useState<NameCheck>("idle");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatusLoading(true);
      try {
        const next = await blogsService.getTeamCreateStatus();
        if (!cancelled) setStatus(next);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "생성 이력을 불러오지 못했습니다"));
        }
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameCheck("idle");
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setNameCheck("checking");
        try {
          const result = await blogsService.checkTeamName(trimmed);
          if (cancelled) return;
          setNameCheck(result.available ? "available" : "taken");
        } catch {
          if (!cancelled) setNameCheck("idle");
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [name]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("팀 블로그 이름을 입력해 주세요");
      return;
    }
    if (nameCheck === "taken") {
      setError("이미 사용 중인 팀 이름입니다");
      return;
    }
    if (!description.trim()) {
      setError("팀 소개를 입력해 주세요");
      return;
    }
    if (status && !status.canCreate) {
      setError("팀 블로그는 주 1회만 만들 수 있습니다");
      return;
    }

    setSubmitting(true);
    try {
      const blog = await blogsService.create({
        type: "team",
        name: name.trim(),
        description: description.trim(),
      });
      router.push(blogHref(blog));
    } catch (err) {
      setError(getErrorMessage(err, "팀 블로그를 만들지 못했습니다"));
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    !submitting &&
    !statusLoading &&
    Boolean(status?.canCreate) &&
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    nameCheck !== "taken" &&
    nameCheck !== "checking";

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>팀 블로그 만들기</h1>
      <p className={styles.hint}>
        팀 블로그는 주 1회만 만들 수 있습니다. 초대코드로만 입장할 수 있습니다.
      </p>

      {!statusLoading && status?.lastCreatedAt && (
        <p className={styles.lastCreatedText} aria-live="polite">
          마지막으로 만든 팀 블로그: {formatDate(status.lastCreatedAt)}
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          이름
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="예: 스터디 팀"
            disabled={status !== null && !status.canCreate}
          />
          {nameCheck === "checking" && (
            <span className={styles.fieldHint}>이름 확인 중…</span>
          )}
          {nameCheck === "available" && (
            <span className={styles.fieldOk}>사용 가능한 이름입니다</span>
          )}
          {nameCheck === "taken" && (
            <span className={styles.fieldError}>이미 사용 중인 이름입니다</span>
          )}
        </label>

        <label className={styles.label}>
          팀 소개
          <textarea
            className={`${styles.textarea} ${styles.textareaCompact}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            placeholder="팀에 대한 소개를 적어 주세요"
            disabled={status !== null && !status.canCreate}
          />
        </label>

        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={!canSubmit}>
            {submitting ? "만드는 중…" : "만들기"}
          </button>
          <Link className={styles.buttonSecondary} href="/?tab=team">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
