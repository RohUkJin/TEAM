import { RequireAuth } from "@/components/RequireAuth";
import { BlogPostCreateForm } from "@/components/BlogPostCreateForm";

type Props = { params: Promise<{ id: string }> };

export default async function BlogWritePage({ params }: Props) {
  const { id } = await params;
  return (
    <RequireAuth>
      <BlogPostCreateForm blogId={id} />
    </RequireAuth>
  );
}
