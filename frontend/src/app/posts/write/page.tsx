import { redirect } from "next/navigation";

export default function PostsWritePage() {
  redirect("/?tab=personal");
}
