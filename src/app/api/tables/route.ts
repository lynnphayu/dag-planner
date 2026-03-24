import type { NextRequest } from "next/server";
import { getAPIConfig } from "@/config/api";

const API_CONFIG = getAPIConfig()();
export async function GET(_request: NextRequest) {
  return fetch(API_CONFIG.ENDPOINTS.TABLES.LIST);
}
