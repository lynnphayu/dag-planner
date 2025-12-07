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
import { create } from "zustand";
import type { stepSchema } from "@/components/forms/step-form";
import { StepType } from "@/components/forms/step-form";
import { NODE_PREF } from "@/config/node";
import type { DAGModel } from "@/hooks/dag";
import {
  buildGraphFromDag,
  createEdge,
  detectCollision as detectCollisionUtil,
  edgeId,
  findAvailablePosition as findAvailablePositionUtil,
  hasEdge,
  reconstructNodes,
  syncNodesOnEdgeAdd,
  syncNodesOnEdgeRemove,
  wouldCreateCycleOnAdd,
} from "@/lib/graph";
import { generateName } from "@/lib/utils";

export type NodeData = z.infer<typeof stepSchema>;

interface FlowState {
  dag: DAGModel | null;
  getDag: () => DAGModel | null;
  setDAG: (dag: DAGModel) => void;
  initializeNewDAG: (id: string, inputSchema?: Record<string, unknown>) => void;
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedNode: () => Node<NodeData> | null;
  setSelectedNodeId: (nodeId: string | null) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (data?: Partial<NodeData>) => void;
  updateNode: (nodeId: string, data: NodeData) => void;
  detectCollision: (node: Node<NodeData>) => boolean;
  findAvailablePosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  onNodesChange: (changes: NodeChange<Node<NodeData>>[]) => void;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  removeNode: (nodeId: string) => void;

  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  wouldCreateCycle: (sourceId: string, targetId: string) => boolean;
  getNodes: () => Node<NodeData>[];
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  dag: null,
  selectedNodeId: null,
  setSelectedNodeId: (nodeId: string | null) => set({ selectedNodeId: nodeId as string }),
  selectedNode: () => {
    const { nodes, selectedNodeId } = get();
    return nodes.find((n) => n.id === selectedNodeId) || null;
  },
  onNodesChange: (changes: NodeChange<Node<NodeData>>[]) =>
    set({ nodes: applyNodeChanges<Node<NodeData>>(changes, get().nodes) }),
  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  getNodes: () => {
    const { nodes } = get();
    return nodes;
  },

  setDAG: (dag: DAGModel) => {
    const { nodes, edges } = buildGraphFromDag(dag, dag.adapters || []);
    set({ nodes, edges, dag });
  },

  initializeNewDAG: (id: string, inputSchema = {}) => {
    const newDAG: DAGModel = {
      id,
      name: id,
      description: "",
      nodes: {},
      inputSchema,
      adapters: [],
      version: 1,
      subversion: 1,
      status: "draft",
    };

    set({
      dag: newDAG,
      nodes: [],
      edges: [],
      selectedNodeId: null,
    });
  },

  addEdge: (edge: Edge) => {
    const source = edge.source;
    const target = edge.target;
    if (!source || !target) return;
    if (source === target) return;
    if (hasEdge(get().edges, source, target)) return;
    if (wouldCreateCycleOnAdd(get().edges, source, target)) return;
    const id = edgeId(source, target);
    const { source: _s, target: _t, id: _i, ...rest } = edge;
    const newEdge: Edge = { ...rest, id, source, target };
    get().onEdgesChange([{ type: "add", item: newEdge }]);
    // Keep node dependencies/dependents in sync with edges
    const updatedNodes = syncNodesOnEdgeAdd(get().nodes, source, target);
    set({ nodes: updatedNodes });
  },

  updateNode: (nodeId: string, data: NodeData) => {
    const { nodes, dag } = get();
    const newNodes = nodes.map((n) => (n.id === nodeId ? { ...n, data } : n));
    const newSteps = {
      ...dag?.nodes,
      [nodeId]: data,
    };
    set({
      nodes: newNodes,
      dag: { ...dag, nodes: newSteps } as DAGModel,
    });
  },

  onConnect: (params: Connection) => {
    const source = params.source ?? "";
    const target = params.target ?? "";
    if (!source || !target) return;
    // Delegate to addEdge for validation + sync behavior
    get().addEdge(createEdge(source, target));
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

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

  detectCollision: (node) => {
    const { nodes } = get();
    return detectCollisionUtil(nodes, node);
  },

  wouldCreateCycle: (sourceId: string, targetId: string): boolean => {
    return wouldCreateCycleOnAdd(get().edges, sourceId, targetId);
  },

  findAvailablePosition: (position) => {
    return findAvailablePositionUtil(get().nodes, position);
  },

  addNode: (data) => {
    const { nodes } = get();
    const pos = findAvailablePositionUtil(nodes, { x: 0, y: 0 });
    const nodeId = crypto.randomUUID();
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
        ...data,
        name: (data?.name && data.name.trim().length > 0
          ? data.name
          : generatedName) as string,
      } as NodeData,
      ...NODE_PREF,
    };
    set({ nodes: [...nodes, newNode] });
  },
  removeNode: (nodeId: string) => {
    const { nodes, edges } = get();
    const newNodes = nodes.filter((n) => n.id !== nodeId);
    const newEdges = edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId,
    );
    set({ nodes: newNodes, edges: newEdges });
  },

  getDag: () => {
    const { nodes, dag } = get();
    if (!dag) throw new Error("DAG is not set");

    const newNodes = reconstructNodes(nodes);
    return {
      ...dag,
      nodes: newNodes,
    } as DAGModel;
  },
}));
