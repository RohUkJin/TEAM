import styles from "@/app/auth.module.css";

type Props = {
  step: 1 | 2;
};

export function SignupSteps({ step }: Props) {
  return (
    <ol className={styles.steps} aria-label="회원가입 진행 단계">
      <li
        className={`${styles.step} ${step === 1 ? styles.stepActive : styles.stepDone}`}
      >
        <span className={styles.stepIndex} aria-hidden>
          1
        </span>
        <span className={styles.stepText}>계정 정보 입력</span>
      </li>
      <li className={styles.stepDivider} aria-hidden />
      <li className={`${styles.step} ${step === 2 ? styles.stepActive : ""}`}>
        <span className={styles.stepIndex} aria-hidden>
          2
        </span>
        <span className={styles.stepText}>이메일 인증</span>
      </li>
    </ol>
  );
}
