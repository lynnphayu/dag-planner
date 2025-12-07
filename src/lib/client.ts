import { getAPIConfig } from "@/config/api";
import type { DAGModel, DAGVersion } from "@/hooks/dag";

const ENDPOINTS = getAPIConfig()().ENDPOINTS
export default {
    fetchDAGs: () => fetch(ENDPOINTS.DAGS.LIST, {
        cache: "no-store",
    }).then(res => res.json()).then(data => ({
        data: data as DAGModel[],
        error: undefined
    })).catch(err => ({
        error: err instanceof Error ? err.message : "Unknown error",
        data: [],
    })),
    fetchDAG: (id: string) => fetch(ENDPOINTS.DAGS.DETAIL(id), {
        cache: "no-store",
    }).then(res => res.json()).then(data => ({
        data: data as DAGModel,
        error: undefined
    })).catch(err => ({
        error: err instanceof Error ? err.message : "Unknown error",
        data: null,
    })),
    fetchDAGVersions: (id: string) => fetch(ENDPOINTS.DAGS.VERSIONS(id), {
        cache: "no-store",
    }).then(res => res.json()).then(data => ({
        data: data as DAGVersion[],
        error: undefined
    })).catch(err => ({
        error: err instanceof Error ? err.message : "Unknown error",
        data: [],
    })),
    fetchTables: () => fetch(ENDPOINTS.TABLES.LIST, {
        cache: "no-store",
    }).then(res => res.json()).then(data => ({
        data: data as string[],
        error: undefined
    })).catch(err => ({
        error: err instanceof Error ? err.message : "Unknown error",
        data: [],
    })),
    fetchTable: (name: string) => fetch(ENDPOINTS.TABLES.DETAIL(name), {
        cache: "no-store",
    }).then(res => res.json()).then(data => ({
        data: data as Record<string, string>,
        error: undefined
    })).catch(err => ({
        error: err instanceof Error ? err.message : "Unknown error",
        data: {},
    })),
}