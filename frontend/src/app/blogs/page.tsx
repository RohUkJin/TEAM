import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ type?: string; page?: string }>;
};

export default async function BlogsPage({ searchParams }: Props) {
  const params = await searchParams;
  if (params.type === "personal") {
    redirect("/?tab=personal");
  }
  const page = params.page && params.page !== "1" ? `&page=${params.page}` : "";
  redirect(`/?tab=team${page}`);
}
