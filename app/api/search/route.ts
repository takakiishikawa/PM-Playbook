import { NextResponse, type NextRequest } from "next/server";
import { findDomain } from "@/content/structure";
import { search } from "@/lib/search";

export function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const q = params.get("q") ?? "";
  // 知らない領域が来たら、絞り込まずに全体から探す
  const domain = findDomain(params.get("domain") ?? "")?.slug;
  return NextResponse.json(search(q, domain));
}
