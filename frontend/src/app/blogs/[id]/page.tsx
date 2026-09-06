import { BlogIdRedirect } from "@/components/BlogIdRedirect";

type Props = { params: Promise<{ id: string }> };

export default async function BlogPage({ params }: Props) {
  const { id } = await params;
  return <BlogIdRedirect blogId={id} />;
}
