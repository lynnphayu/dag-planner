import type { NextRequest } from "next/server";
import { serverAPIConfig } from "@/config/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  return fetch(serverAPIConfig.ENDPOINTS.TABLES.DETAIL(name));
}
