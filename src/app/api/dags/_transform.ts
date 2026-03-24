import type {
  Adapter,
  CronAdapter,
  DAGModel,
  HTTPAdapter,
  Step,
} from "@/hooks/dag";

/** A step as the backend stores it: no computed `dependents` field. */
type BackendStep = Omit<Step, "dependents">;

/**
 * Raw shape returned by / sent to the backend API.
 *
 * Differences from the frontend `DAGModel`:
 *  - `nodes` is a keyed Record, not an array
 *  - adapters live in a separate `adapters` array
 */
export interface BackendDAGModel extends Omit<DAGModel, "nodes"> {
  nodes: Record<string, BackendStep>;
  adapters: Adapter[];
}

const ADAPTER_TYPES = new Set(["http_adapter", "schedular_adapter"]);

export const isAdapterType = (type: string): boolean => ADAPTER_TYPES.has(type);

/**
 * Translates a backend DAG payload into the unified frontend `DAGModel`.
 *
 * What changes:
 *  - `nodes` Record is flattened to an array of `Step` objects
 *  - Each `Adapter` is normalised into the same `Step` shape
 *    (type + meta kept under `data`, extra backend fields dropped)
 *  - Top-level `adapters` field is removed
 */
export function toFrontendDAG(backend: BackendDAGModel): DAGModel {
  const steps = Object.values(backend.nodes) as Step[];

  const adapterNodes: Step[] = backend.adapters.map((adapter) => ({
    id: adapter.id,
    name: adapter.name,
    createdAt: adapter.createdAt,
    // No dependencies / dependents – adapters are standalone nodes
    data: {
      type: adapter.type,
      meta: adapter.meta,
      // `adapter.input` (runtime key mapping) becomes `data.input`
      input: adapter.input,
    } as Step["data"],
  }));

  return {
    id: backend.id,
    name: backend.name,
    description: backend.description,
    inputSchema: backend.inputSchema,
    version: backend.version,
    subversion: backend.subversion,
    status: backend.status,
    nodes: [...steps, ...adapterNodes],
  };
}

/**
 * Translates a frontend `DAGModel` back into the backend shape before
 * forwarding a PUT request.
 *
 * What changes:
 *  - Step nodes are converted back to a keyed Record (dependents stripped)
 *  - Adapter nodes are reconstructed into the flat `Adapter` shape and
 *    moved into the top-level `adapters` array
 */
export function toBackendDAG(
  frontend: DAGModel,
  dagId: string,
): BackendDAGModel {
  const stepNodes = frontend.nodes.filter((n) => !isAdapterType(n.data.type));
  const adapterNodes = frontend.nodes.filter((n) => isAdapterType(n.data.type));

  const nodesRecord: Record<string, BackendStep> = Object.fromEntries(
    stepNodes.map((s) => {
      const step: BackendStep = {
        id: s.id,
        name: s.name,
        createdAt: s.createdAt,
        dependencies: s.dependencies,
        data: s.data,
      };
      return [s.id, step];
    }),
  );

  const adaptersArray: Adapter[] = adapterNodes.map((n) => {
    const adapterSpecific = n.data as HTTPAdapter | CronAdapter;
    return {
      _id: n.id,
      id: n.id,
      graphId: dagId,
      name: n.name,
      createdAt: n.createdAt,
      user_id: "",
      ...adapterSpecific,
      // `data.input` maps back to the top-level `adapter.input`
      input: (n.data as { input?: Record<string, string> }).input ?? {},
    };
  });

  return {
    ...frontend,
    nodes: nodesRecord,
    adapters: adaptersArray,
  };
}
