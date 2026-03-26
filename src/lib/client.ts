import { clientAPIConfig } from "@/config/api";
import type { DAGModel, DAGVersion } from "@/hooks/dag";
import type { Table } from "@/store/table-store";

const { ENDPOINTS } = clientAPIConfig;

export function createClient(headers?: HeadersInit) {
  const get = (url: string) => fetch(url, { headers });

  return {
    fetchDAGs: () =>
      get(ENDPOINTS.DAGS.LIST).then((res) => res.json() as Promise<DAGModel[]>),
    fetchDAG: (id: string) =>
      get(ENDPOINTS.DAGS.DETAIL(id)).then(
        (res) => res.json() as Promise<DAGModel>,
      ),
    fetchDAGVersions: (id: string) =>
      get(ENDPOINTS.DAGS.VERSIONS(id)).then(
        (res) => res.json() as Promise<DAGVersion[]>,
      ),
    fetchTables: () =>
      get(ENDPOINTS.TABLES.LIST).then((res) => res.json() as Promise<string[]>),
    fetchTable: (name: string) =>
      get(ENDPOINTS.TABLES.DETAIL(name)).then(
        (res) => res.json() as Promise<Record<string, string>>,
      ),
    fetchTablesWithDetails: () =>
      get(ENDPOINTS.TABLES.WITH_DETAILS).then(
        (res) => res.json() as Promise<Table[]>,
      ),
  };
}

export default createClient();
