import styles from "./PostMetaStats.module.css";

type Props = {
  dateLabel: string;
  dateTime?: string;
  views?: number;
  comments?: number;
  className?: string;
};

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
      <path
        d="M5 5.75h14a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.25 3V16.25H5a1.5 1.5 0 0 1-1.5-1.5v-7.5A1.5 1.5 0 0 1 5 5.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 날짜 · 👁 조회수 · 💬 댓글수 */
export function PostMetaStats({
  dateLabel,
  dateTime,
  views,
  comments,
  className,
}: Props) {
  const showViews = typeof views === "number";
  const showComments = typeof comments === "number";

  return (
    <span className={[styles.meta, className].filter(Boolean).join(" ")}>
      {dateTime ? <time dateTime={dateTime}>{dateLabel}</time> : dateLabel}
      {showViews && (
        <>
          <span className={styles.sep} aria-hidden>
            ·
          </span>
          <span className={styles.stat} title={`조회 ${views}`}>
            <EyeIcon />
            <span className={styles.srOnly}>조회 </span>
            {views}
          </span>
        </>
      )}
      {showComments && (
        <>
          <span className={styles.sep} aria-hidden>
            ·
          </span>
          <span className={styles.stat} title={`댓글 ${comments}`}>
            <CommentIcon />
            <span className={styles.srOnly}>댓글 </span>
            {comments}
          </span>
        </>
      )}
    </span>
  );
}
