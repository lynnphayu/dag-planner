import { getAPIConfig } from "@/config/api";
import type { DAGModel, DAGVersion } from "@/hooks/dag";

const ENDPOINTS = getAPIConfig()().ENDPOINTS;

const client = {
  fetchDAGs: () =>
    fetch(ENDPOINTS.DAGS.LIST, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => ({
        data: data as DAGModel[],
        error: undefined,
      })),

  fetchDAG: (id: string) =>
    fetch(ENDPOINTS.DAGS.DETAIL(id), {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => ({
        data: data as DAGModel,
        error: undefined,
      })),
  fetchDAGVersions: (id: string) =>
    fetch(ENDPOINTS.DAGS.VERSIONS(id), {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => ({
        data: data as DAGVersion[],
        error: undefined,
      })),
  fetchTables: () =>
    fetch(ENDPOINTS.TABLES.LIST, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => ({
        data: data as string[],
        error: undefined,
      })),
  fetchTable: (name: string) =>
    fetch(ENDPOINTS.TABLES.DETAIL(name), {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => ({
        data: data as Record<string, string>,
        error: undefined,
      })),
};

export default client;