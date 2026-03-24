import { getAPIConfig } from "@/config/api";
import type { DAGModel, DAGVersion } from "@/hooks/dag";
import type { Table } from "@/store/table-store";

const ENDPOINTS = getAPIConfig("http://localhost:3005/api")().ENDPOINTS;

const client = {
  fetchDAGs: () =>
    fetch(ENDPOINTS.DAGS.LIST).then((res) => res.json() as Promise<DAGModel[]>),
  fetchDAG: (id: string) =>
    fetch(ENDPOINTS.DAGS.DETAIL(id)).then(
      (res) => res.json() as Promise<DAGModel>,
    ),
  fetchDAGVersions: (id: string) =>
    fetch(ENDPOINTS.DAGS.VERSIONS(id)).then(
      (res) => res.json() as Promise<DAGVersion[]>,
    ),
  fetchTables: () =>
    fetch(ENDPOINTS.TABLES.LIST).then((res) => res.json() as Promise<string[]>),
  fetchTable: (name: string) =>
    fetch(ENDPOINTS.TABLES.DETAIL(name)).then(
      (res) => res.json() as Promise<Record<string, string>>,
    ),
  fetchTablesWithDetails: () =>
    fetch(ENDPOINTS.TABLES.WITH_DETAILS).then(
      (res) => res.json() as Promise<Table[]>,
    ),
};

export default client;
