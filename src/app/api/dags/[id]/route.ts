import { serverAPIConfig } from "@/config/api";
import type { DAGModel } from "@/hooks/dag";
import { withAuth } from "@/lib/auth";
import {
  type BackendDAGModel,
  toBackendDAG,
  toFrontendDAG,
} from "../_transform";

export const GET = withAuth<"/api/dags/[id]">(
  async (_request, { params, user }) => {
    const { id } = await params;
    const backend = await fetch(serverAPIConfig.ENDPOINTS.DAGS.DETAIL(id), {
      headers: { "x-user-id": user.userId },
    }).then((res) => res.json() as Promise<BackendDAGModel>);
    return Response.json(toFrontendDAG(backend));
  },
);

export const PUT = withAuth<"/api/dags/[id]">(
  async (request, { params, user }) => {
    const { id } = await params;
    const frontend = (await request.json()) as DAGModel;
    const backend = toBackendDAG(frontend, id);
    return fetch(serverAPIConfig.ENDPOINTS.DAGS.DETAIL(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-id": user.userId },
      body: JSON.stringify(backend),
    });
  },
);
