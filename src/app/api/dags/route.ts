import { serverAPIConfig } from "@/config/api";
import type { DAGModel } from "@/hooks/dag";
import { withAuth } from "@/lib/auth";
import {
  type BackendDAGModel,
  toBackendDAG,
  toFrontendDAG,
} from "./_transform";

export const GET = withAuth<"/api/dags">(async (_request, { user }) => {
  const backends = await fetch(serverAPIConfig.ENDPOINTS.DAGS.LIST, {
    headers: { "x-user-id": user.userId },
  }).then((res) => res.json() as Promise<BackendDAGModel[]>);
  return Response.json(backends.map(toFrontendDAG));
});

export const POST = withAuth<"/api/dags">(async (request, { user }) => {
  const frontend = (await request.json()) as Omit<DAGModel, "id">;
  const backend = toBackendDAG(frontend as DAGModel, "");
  const created = await fetch(serverAPIConfig.ENDPOINTS.DAGS.LIST, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": user.userId },
    body: JSON.stringify(backend),
  }).then((res) => res.json() as Promise<BackendDAGModel>);
  return Response.json(toFrontendDAG(created), { status: 201 });
});
