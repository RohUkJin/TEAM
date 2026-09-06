import { notFound } from "next/navigation";
import { PostIdRedirect } from "@/components/PostIdRedirect";
import { isPositiveIntId } from "@/lib/ids";

type Props = { params: Promise<{ id: string }> };

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  if (!isPositiveIntId(id)) {
    notFound();
  }
  return <PostIdRedirect postId={id} />;
}
