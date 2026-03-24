import type { NextRequest } from "next/server";
import { serverAPIConfig } from "@/config/api";

export async function GET(_request: NextRequest) {
  return fetch(serverAPIConfig.ENDPOINTS.TABLES.LIST);
}
