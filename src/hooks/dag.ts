import type { Edge, Node } from "@xyflow/react";
import { toast } from "sonner";
import type { SWRConfiguration } from "swr";
import useSWR, { useSWRConfig } from "swr";

import type { z } from "zod";
import type { stepSchema } from "@/components/forms/step-form";
import { clientAPIConfig } from "@/config/api";
import type { NodeData } from "@/store/flow-store";
import type { Tables } from "@/store/table-store";

export interface DAG {
  id: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export type Step = z.output<typeof stepSchema>;

export interface DAGModel {
  id: string;
  name: string;
  description?: string;
  nodes: Step[];
  inputSchema: Record<string, unknown>;
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

const { ENDPOINTS } = clientAPIConfig;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useTables = (config?: SWRConfiguration<Tables>) =>
  useSWR<Tables>(ENDPOINTS.TABLES.WITH_DETAILS, fetcher, config);

export const useTable = (name: string) =>
  useSWR<{ data: Record<string, string> }>(
    ENDPOINTS.TABLES.DETAIL(name),
    fetcher,
  );

export const useDAG = (id: string, config?: SWRConfiguration<DAGModel>) =>
  useSWR<DAGModel>(ENDPOINTS.DAGS.DETAIL(id), fetcher, config);

export const useDAGs = () => useSWR<DAGModel[]>(ENDPOINTS.DAGS.LIST, fetcher);

export const useDAGVersions = (id: string) =>
  useSWR<DAGVersion[]>(ENDPOINTS.DAGS.VERSIONS(id), fetcher);

export function useDAGMutations() {
  const { mutate } = useSWRConfig();

  const createDAG = async (dag: Omit<DAGModel, "id">) =>
    fetch(ENDPOINTS.DAGS.LIST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dag),
    })
      .then((x) => {
        mutate(ENDPOINTS.DAGS.LIST);
        toast.success("DAG created");
        return x.json();
      })
      .catch((e) => toast.error(`Error creating DAG - ${e.message}`));

  const updateDAG = async (id: string, dag: Partial<DAGModel>) =>
    fetch(ENDPOINTS.DAGS.DETAIL(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dag),
    })
      .then((x) => {
        mutate(ENDPOINTS.DAGS.LIST);
        mutate(ENDPOINTS.DAGS.DETAIL(id));
        toast.success("DAG updated");
        return x.json();
      })
      .catch((e) => toast.error(`Error updating DAG - ${e.message}`));

  const executeDAG = async (
    id: string,
    inputData?: Record<string, unknown>,
  ) => {
    const response = await fetch(ENDPOINTS.DAGS.EXECUTE(id), {
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
    const response = await fetch(ENDPOINTS.DAGS.PUBLISH(id), {
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
    mutate(ENDPOINTS.DAGS.VERSIONS);
    mutate(ENDPOINTS.DAGS.LIST);
    mutate(ENDPOINTS.DAGS.DETAIL(id));
    return responseData;
  };

  return {
    createDAG,
    updateDAG,
    executeDAG,
    publishDAG,
  };
}
