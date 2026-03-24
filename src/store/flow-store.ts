import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesChange,
} from "@xyflow/react";
import { applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import type { z } from "zod";
import { create, type StateCreator } from "zustand";
import type { stepSchema } from "@/components/forms/step-form";
import { StepType } from "@/components/forms/step-form";
import {
  STEP_NODE_PREF,
  STEP_NODE_SPACING,
  STEP_NODE_WIDTH,
  TABLE_NODE_PREF,
} from "@/config/node";
import type { DAGModel } from "@/hooks/dag";
import {
  buildGraphFromDag,
  createEdge,
  edgeId,
  findAvailablePosition as findAvailablePositionUtil,
  hasEdge,
  type NodeDataBase,
  syncNodesOnEdgeAdd,
  syncNodesOnEdgeRemove,
  wouldCreateCycleOnAdd,
} from "@/lib/graph";
import { generateName } from "@/lib/utils";
import type { Table } from "./table-store";

export type NodeData = z.infer<typeof stepSchema>;

interface FlowState {
  dag: DAGModel | null;
  selectedNode: Node<NodeData> | null;

  getDag: () => DAGModel;
  setDAG: (dag: DAGModel) => void;
  initializeNewDAG: (id: string, inputSchema?: Record<string, unknown>) => void;
  setSelectedNode: (nodeId: string | null) => void;
  addAdapterNode: () => void;
  addStepNode: () => void;
}

export type GraphState<T extends NodeDataBase> = {
  nodes: Node<T>[];
  edges: Edge[];

  setNodes: (nodes: Node<T>[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNode: (nodeId: string, data: T) => void;
  onNodesChange: (changes: NodeChange<Node<T>>[]) => void;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  wouldCreateCycle: (sourceId: string, targetId: string) => boolean;
};

export const createGraphSlice =
  <T extends NodeDataBase>(): StateCreator<
    GraphState<T>,
    [],
    [],
    GraphState<T>
  > =>
  (set, get) => ({
    nodes: [],
    edges: [],
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    onNodesChange: (changes) =>
      set(({ nodes }) => ({
        nodes: applyNodeChanges(changes, nodes),
      })),
    onEdgesChange: (changes: EdgeChange[]) => {
      set(({ edges }) => ({ edges: applyEdgeChanges(changes, edges) }));
    },
    addEdge: (edge: Edge) => {
      const source = edge.source;
      const target = edge.target;
      if (!source || !target) return;
      if (source === target) return;
      if (hasEdge(get().edges, source, target)) return;
      if (wouldCreateCycleOnAdd(get().edges, source, target)) return;

      const id = edgeId(source, target);
      const newEdge: Edge = { ...edge, id, source, target };
      get().onEdgesChange([{ type: "add", item: newEdge }]);
      const updatedNodes = syncNodesOnEdgeAdd(get().nodes, source, target);
      set({ nodes: updatedNodes });
    },

    updateNode: (nodeId, data) => {
      set(({ nodes }) => ({
        nodes: nodes.map((n) => (n.id === nodeId ? { ...n, data } : n)),
      }));
    },

    onConnect: (params: Connection) => {
      const source = params.source ?? "";
      const target = params.target ?? "";
      if (!source || !target) return;
      get().addEdge(createEdge(source, target));
    },

    removeEdge: (edgeId: string) => {
      const existing = get().edges.find((e) => e.id === edgeId);
      if (existing?.source && existing?.target) {
        // sync node dependency/dependents removal
        const source = existing.source;
        const target = existing.target;
        const updatedNodes = syncNodesOnEdgeRemove(get().nodes, source, target);
        set({ nodes: updatedNodes });
      }
      get().onEdgesChange([{ type: "remove", id: edgeId }]);
    },

    wouldCreateCycle: (sourceId: string, targetId: string): boolean => {
      return wouldCreateCycleOnAdd(get().edges, sourceId, targetId);
    },

    removeNode: (nodeId: string) => {
      const { nodes, edges } = get();
      const newNodes = nodes.filter((n) => n.id !== nodeId);
      const newEdges = edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      );
      set({ nodes: newNodes, edges: newEdges });
    },
  });

export const createFlowSlice: StateCreator<
  FlowState & GraphState<NodeData>,
  [],
  [],
  FlowState
> = (set, get) => ({
  dag: null,
  selectedNode: null,

  addAdapterNode: () => {
    const { nodes } = get();
    const pos = findAvailablePositionUtil(nodes, { x: 0, y: 0 }, "vertical");
    const nodeId = crypto.randomUUID();
    const generatedName = generateName();
    const newNode = {
      id: nodeId,
      position: pos,
      type: "AdapterNode",
      data: {
        id: nodeId,
        data: {
          type: "http_adapter",
          meta: {
            method: "get",
            path: "",
            query: {},
            headers: {},
            body: {},
            authType: "none",
          },
        },
        name: generatedName,
      } as NodeData,
      ...STEP_NODE_PREF,
    };
    set({ nodes: [...nodes, newNode] });
  },
  addStepNode: () => {
    const { nodes } = get();
    const nodeId = crypto.randomUUID();
    const pos = findAvailablePositionUtil(nodes, {
      x: STEP_NODE_WIDTH + STEP_NODE_SPACING,
      y: 0,
    });
    const generatedName = generateName();
    const newNode = {
      id: nodeId,
      position: pos,
      type: "StepNode",
      data: {
        id: nodeId,
        data: {
          type: StepType.enum.query,
          meta: {
            table: "",
            where: {},
            select: [],
          },
        },
        name: generatedName,
      } as NodeData,
      ...STEP_NODE_PREF,
    };
    set({ nodes: [...nodes, newNode] });
  },

  getDag: () => {
    const { nodes, dag } = get();
    if (!dag) throw new Error("DAG is not set");
    // Collect live data from every canvas node (steps + adapters)
    const allNodes = nodes
      .filter((n) => n.type === "StepNode" || n.type === "AdapterNode")
      .map((n) => n.data);
    return {
      ...dag,
      nodes: allNodes,
    } as DAGModel;
  },
  setSelectedNode: (nodeId: string | null) => {
    if (!nodeId) return set({ selectedNode: null });
    const node = get().nodes.find((n) => n.id === nodeId);
    set({ selectedNode: node });
  },
  setDAG: (dag: DAGModel) => {
    const isAdapterType = (type: string) =>
      type === "http_adapter" || type === "schedular_adapter";

    const stepNodes = dag.nodes.filter((n) => !isAdapterType(n.data.type));
    const adapterNodes = dag.nodes.filter((n) => isAdapterType(n.data.type));

    const positionedNodes = buildGraphFromDag(stepNodes, "StepNode", [0, 1]);
    const positionedAdapters = buildGraphFromDag(
      adapterNodes,
      "AdapterNode",
      [0, 0],
    );
    set({
      nodes: [...positionedNodes.nodes, ...positionedAdapters.nodes],
      edges: [...positionedNodes.edges, ...positionedAdapters.edges],
      dag,
    });
  },

  initializeNewDAG: (id: string, inputSchema = {}) => {
    const newDAG: DAGModel = {
      id,
      name: id,
      description: "",
      nodes: [],
      inputSchema,
      version: 1,
      subversion: 1,
      status: "draft",
    };

    set({
      dag: newDAG,
      selectedNode: null,
    });
  },
});

interface TableState {
  tables: Table[];
  setTables: (tables: Table[]) => void;
}

export interface TableNodeData extends NodeDataBase, Record<string, unknown> {
  data: Table;
}

export const createTableSlice: StateCreator<
  TableState & GraphState<TableNodeData>,
  [],
  [],
  TableState
> = (set) => ({
  tables: [],
  setTables: (tables) => {
    const tablesData = tables.map((table) => ({
      id: table.name,
      name: table.name,
      data: table,
    }));
    set({ tables });
    const { nodes, edges } = buildGraphFromDag(
      tablesData,
      "TableNode",
      [0, 0],
      TABLE_NODE_PREF,
    );
    // Remove fixed height from table nodes to allow auto-sizing
    const nodesWithoutHeight = nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        height: undefined,
      },
    }));
    set({
      nodes: nodesWithoutHeight,
      edges,
    });
  },
});

export const useTableStore = create<TableState & GraphState<TableNodeData>>(
  (...a) => ({
    ...createTableSlice(...a),
    ...createGraphSlice<TableNodeData>()(...a),
  }),
);

export const useFlowStore = create<FlowState & GraphState<NodeData>>(
  (...a) => ({
    ...createFlowSlice(...a),
    ...createGraphSlice<NodeData>()(...a),
  }),
);
