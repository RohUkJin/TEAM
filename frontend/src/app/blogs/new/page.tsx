import { RequireAuth } from "@/components/RequireAuth";
import { CreateTeamBlogForm } from "@/components/CreateTeamBlogForm";

export default function NewBlogPage() {
  return (
    <RequireAuth>
      <CreateTeamBlogForm />
    </RequireAuth>
  );
}
