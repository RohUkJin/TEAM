import { PostEditForm } from "@/components/PostEditForm";
import { RequireAuth } from "@/components/RequireAuth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PostEditPage({ params }: Props) {
  const { id } = await params;
  return (
    <RequireAuth>
      <PostEditForm postId={id} />
    </RequireAuth>
  );
}
