import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search";

// ビルド時に1回だけ作り、以後は静的ファイルとして返す（proxy の認証は通る）
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(buildSearchIndex());
}
