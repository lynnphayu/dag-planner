import type { NextRequest } from "next/server";
import { getAPIConfig } from "@/config/api";
import { type BackendDAGModel, toFrontendDAG } from "./_transform";

const API_CONFIG = getAPIConfig()();

export async function GET(_request: NextRequest) {
  const backends = await fetch(API_CONFIG.ENDPOINTS.DAGS.LIST).then(
    (res) => res.json() as Promise<BackendDAGModel[]>,
  );
  return Response.json(backends.map(toFrontendDAG));
}
