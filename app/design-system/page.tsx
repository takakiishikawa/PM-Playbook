import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = { title: "デザインシステム" };

export default function DesignSystemPage() {
  return <StaticPage name="design-system" label="デザインシステム" wide />;
}
