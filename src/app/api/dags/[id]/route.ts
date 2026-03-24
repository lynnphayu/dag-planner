import type { NextRequest } from "next/server";
import { getAPIConfig } from "@/config/api";

const API_CONFIG = getAPIConfig()();
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return fetch(API_CONFIG.ENDPOINTS.DAGS.DETAIL(id));
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await _request.json();
  return fetch(API_CONFIG.ENDPOINTS.DAGS.DETAIL(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
