import type { NextRequest } from "next/server";
import { serverAPIConfig } from "@/config/api";
import type { DAGModel } from "@/hooks/dag";
import {
  type BackendDAGModel,
  toBackendDAG,
  toFrontendDAG,
} from "../_transform";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const backend = await fetch(serverAPIConfig.ENDPOINTS.DAGS.DETAIL(id)).then(
    (res) => res.json() as Promise<BackendDAGModel>,
  );
  return Response.json(toFrontendDAG(backend));
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const frontend = (await _request.json()) as DAGModel;
  const backend = toBackendDAG(frontend, id);
  return fetch(serverAPIConfig.ENDPOINTS.DAGS.DETAIL(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(backend),
  });
}
