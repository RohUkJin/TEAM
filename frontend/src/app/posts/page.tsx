import { redirect } from "next/navigation";

export default function PostsPage() {
  redirect("/?tab=personal");
}
