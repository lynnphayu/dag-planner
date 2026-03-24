import type { Edge, Node } from "@xyflow/react";
import { toast } from "sonner";
import type { SWRConfiguration } from "swr";
import useSWR, { useSWRConfig } from "swr";

import type { z } from "zod";
import type { stepSchema } from "@/components/forms/step-form";
import { getAPIConfig } from "@/config/api";
import type { NodeData } from "@/store/flow-store";
import type { Tables } from "@/store/table-store";

export interface DAG {
  id: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export type Step = z.output<typeof stepSchema>;
// BaseStep<
//   ({ type: "query" } & { meta: QueryParams })
//   | ({ type: "insert" } & { meta: InsertParams })
//   | ({ type: "update" } & { meta: UpdateParams })
//   | ({ type: "delete" } & { meta: DeleteParams })
//   | ({ type: "join" } & { meta: JoinParams })
//   | ({ type: "filter" } & { meta: FilterParams })
//   | ({ type: "map" } & { meta: MapParams })
//   | ({ type: "condition" } & { meta: ConditionParams })
//   | ({ type: "http" } & { meta: HTTPParams })
// >;

export interface DAGModel {
  id: string;
  name: string;
  description?: string;
  nodes: { [key: string]: Step };
  inputSchema: Record<string, unknown>;
  adapters: Adapter[];
  version: number;
  subversion: number;
  status: string;
}

export interface DAGVersion {
  version: number;
  subversion: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HTTPAdapter {
  type: "http_adapter";
  meta: {
    method: "get" | "post" | "put" | "delete" | "patch";
    path: string;
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
    response?: unknown;
    authType: "none" | "basic" | "bearer" | "apiKey";
    auth?: Record<string, unknown>;
  };
}

export interface CronAdapter {
  type: "schedular_adapter";
  meta: {
    schedule: string;
  };
}

export type Adapter = {
  _id: string;
  graphId: string;
  id: string;
  input: Record<string, string>;
  name: string;
  user_id: string;
  createdAt?: string;
} & (HTTPAdapter | CronAdapter);

const API_CONFIG = getAPIConfig("http://localhost:3005/api")();
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useTables = (config?: SWRConfiguration<Tables>) =>
  useSWR<Tables>(API_CONFIG.ENDPOINTS.TABLES.WITH_DETAILS, fetcher, config);

export const useTable = (name: string) =>
  useSWR<{ data: Record<string, string> }>(
    API_CONFIG.ENDPOINTS.TABLES.DETAIL(name),
    fetcher,
  );

export const useDAG = (id: string, config?: SWRConfiguration<DAGModel>) =>
  useSWR<DAGModel>(API_CONFIG.ENDPOINTS.DAGS.DETAIL(id), fetcher, config);

export const useDAGs = () =>
  useSWR<DAGModel[]>(API_CONFIG.ENDPOINTS.DAGS.LIST, fetcher);

export const useDAGVersions = (id: string) =>
  useSWR<DAGVersion[]>(API_CONFIG.ENDPOINTS.DAGS.VERSIONS(id), fetcher);

export function useDAGMutations() {
  const { mutate } = useSWRConfig();

  const createDAG = async (dag: Omit<DAGModel, "id">) =>
    fetch(API_CONFIG.ENDPOINTS.DAGS.LIST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dag),
    })
      .then((x) => {
        mutate(API_CONFIG.ENDPOINTS.DAGS.LIST);
        toast.success("DAG created");
        return x.json();
      })
      .catch((e) => toast.error(`Error creating DAG - ${e.message}`));

  const updateDAG = async (id: string, dag: Partial<DAGModel>) =>
    fetch(API_CONFIG.ENDPOINTS.DAGS.DETAIL(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dag),
    })
      .then((x) => {
        mutate(API_CONFIG.ENDPOINTS.DAGS.LIST);
        mutate(API_CONFIG.ENDPOINTS.DAGS.DETAIL(id));
        toast.success("DAG updated");
        return x.json();
      })
      .catch((e) => toast.error(`Error updating DAG - ${e.message}`));

  const executeDAG = async (
    id: string,
    inputData?: Record<string, unknown>,
  ) => {
    const response = await fetch(API_CONFIG.ENDPOINTS.DAGS.EXECUTE(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputData || {}),
    });

    const responseData = await response.json();

    if (!response.ok) {
      toast.error(
        `Error executing DAG - ${response.status} ${response.statusText}`,
      );
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    toast.success("DAG execution completed");

    // Return both HTTP response details and data
    return {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
      },
      data: responseData,
    };
  };

  const publishDAG = async (id: string) => {
    const response = await fetch(API_CONFIG.ENDPOINTS.DAGS.PUBLISH(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const responseData = await response.json();
    if (!response.ok) {
      toast.error(
        `Error publishing DAG - ${response.status} ${response.statusText}`,
      );
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    toast.success("DAG published");
    mutate(API_CONFIG.ENDPOINTS.DAGS.LIST);
    mutate(API_CONFIG.ENDPOINTS.DAGS.DETAIL(id));
    return responseData;
  };

  return {
    createDAG,
    updateDAG,
    executeDAG,
    publishDAG,
  };
}
