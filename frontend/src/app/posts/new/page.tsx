import { redirect } from "next/navigation";

/** 과제 경로 /posts/write 로 통일 */
export default function NewPostRedirectPage() {
  redirect("/posts/write");
}
