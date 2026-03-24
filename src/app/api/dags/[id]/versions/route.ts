import type { NextRequest } from "next/server";
import { serverAPIConfig } from "@/config/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return fetch(serverAPIConfig.ENDPOINTS.DAGS.VERSIONS(id));
}
