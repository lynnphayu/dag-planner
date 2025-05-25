import useSWR, { useSWRConfig } from "swr";
import { Node, Edge } from "@xyflow/react";
import { NodeData } from "@/store/flow-store";
import { Operator, StepType } from "@/components/step-form";
import { z } from "zod";
import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";

export interface DAG {
  id: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
}

// Query params
export interface QueryParams {
  table: string;
  where?: Record<string, unknown>;
}

// Insert params
export interface InsertParams {
  table: string;
  values: Record<string, unknown>;
}

// Update params
export interface UpdateParams {
  table: string;
  set: Record<string, unknown>;
  where?: Record<string, unknown>;
}

// Delete params
export interface DeleteParams {
  table: string;
  where?: Record<string, unknown>;
}

// Join params
export interface JoinParams {
  type: "inner" | "left" | "right";
  left: string;
  right: string;
  on: Record<string, string>;
}

// Filter params
export interface FilterParams {
  filter: Record<string, unknown>;
}

// Map params
export interface MapParams {
  function: string;
}

export interface Condition {
  left: string;
  right: string;
  operator: z.infer<typeof Operator>;
}

// Condition params
export interface ConditionParams {
  if: Condition;
  else: string[];
}

// HTTP params
export interface HTTPParams {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
}

// Combined Params type
export type Params =
  | QueryParams
  | InsertParams
  | UpdateParams
  | DeleteParams
  | JoinParams
  | FilterParams
  | MapParams
  | ConditionParams
  | HTTPParams;

export type Step<
  T extends z.infer<typeof StepType> = z.infer<typeof StepType>
> = (T extends "query"
  ? QueryParams
  : T extends "insert"
  ? InsertParams
  : T extends "update"
  ? UpdateParams
  : T extends "delete"
  ? DeleteParams
  : T extends "join"
  ? JoinParams
  : T extends "filter"
  ? FilterParams
  : T extends "map"
  ? MapParams
  : T extends "condition"
  ? ConditionParams
  : T extends "http"
  ? HTTPParams
  : never) & {
  id: string;
  type: T;
  then: string[];
  dependsOn: string[];
};

export interface DAGModel {
  id: string;
  steps: Step[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch DAG data");
  }
  return res.json();
};

export function useDAG(id?: string) {
  const { data, error, isLoading } = useSWR<DAGModel>(
    id ? API_CONFIG.ENDPOINTS.DAGS.DETAIL(id) : null,
    fetcher
  );

  return {
    dag: data,
    isLoading,
    isError: error,
  };
}

export function useDAGs() {
  const { data, error, isLoading } = useSWR<DAGModel[]>(
    API_CONFIG.ENDPOINTS.DAGS.LIST,
    fetcher
  );

  return {
    dags: data,
    isLoading,
    isError: error,
  };
}

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

  return {
    createDAG,
    updateDAG,
  };
}
