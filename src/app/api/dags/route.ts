import type { NextRequest } from "next/server";
import { serverAPIConfig } from "@/config/api";
import { type BackendDAGModel, toFrontendDAG } from "./_transform";

export async function GET(_request: NextRequest) {
  const backends = await fetch(serverAPIConfig.ENDPOINTS.DAGS.LIST).then(
    (res) => res.json() as Promise<BackendDAGModel[]>,
  );
  return Response.json(backends.map(toFrontendDAG));
}
