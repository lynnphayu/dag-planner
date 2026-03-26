import type { NextRequest } from "next/server";
import { serverAPIConfig } from "@/config/api";
import type { DAGModel } from "@/hooks/dag";
import {
  type BackendDAGModel,
  toBackendDAG,
  toFrontendDAG,
} from "./_transform";

export async function GET(_request: NextRequest) {
  const backends = await fetch(serverAPIConfig.ENDPOINTS.DAGS.LIST).then(
    (res) => res.json() as Promise<BackendDAGModel[]>,
  );
  return Response.json(backends.map(toFrontendDAG));
}

export async function POST(request: NextRequest) {
  const frontend = (await request.json()) as Omit<DAGModel, "id">;
  const backend = toBackendDAG(frontend as DAGModel, "");
  const created = await fetch(serverAPIConfig.ENDPOINTS.DAGS.LIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(backend),
  }).then((res) => res.json() as Promise<BackendDAGModel>);
  return Response.json(toFrontendDAG(created), { status: 201 });
}
