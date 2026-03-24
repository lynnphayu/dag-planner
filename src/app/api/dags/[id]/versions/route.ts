import type { NextRequest } from "next/server";
import { getAPIConfig } from "@/config/api";

const API_CONFIG = getAPIConfig()();
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return fetch(API_CONFIG.ENDPOINTS.DAGS.VERSIONS(id));
}
