import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = { title: "コンセプト" };

export default function ConceptPage() {
  return <StaticPage name="concept" label="コンセプト" />;
}
