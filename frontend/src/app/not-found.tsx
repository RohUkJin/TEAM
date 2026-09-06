import type { Metadata } from "next";
import { NotFoundView } from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요 · TEAM",
};

export default function NotFound() {
  return <NotFoundView />;
}
