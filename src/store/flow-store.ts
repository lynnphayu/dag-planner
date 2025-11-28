import type {
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
import { GRID_SIZE, NODE_PREF } from "@/config/node";
import type { Adapter, ConditionParams, DAGModel, Step } from "@/hooks/dag";
export type NodeData = z.infer<typeof stepSchema>;
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

interface FlowState {
  dag: DAGModel | null;
  getDag: () => DAGModel | null;
  setDAG: (dag: DAGModel, adapters?: Adapter[]) => void;
  initializeNewDAG: (id: string, inputSchema?: Record<string, unknown>) => void;
  nodes: Node<NodeData>[];
  edges: { id: string; source: string; target: string }[];
  isSheetOpen: boolean;
  selectedNodeId: string | null;
  selectedNode: () => Node<NodeData> | null;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: { id: string; source: string; target: string }[]) => void;
  addNode: (data?: Partial<NodeData>) => void;
  updateNode: (nodeId: string, data: NodeData) => void;
  openSheet: (nodeId: string) => void;
  closeSheet: () => void;
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
  isSheetOpen: false,
  selectedNodeId: null,
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

  setDAG: async (dag: DAGModel, adapters: Adapter[] = []) => {
    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];
    const visited = new Set<string>();

    const positionNode = (
      stepId: string,
      column: number,
      row: number,
    ): void => {
      if (visited.has(stepId)) return;
      visited.add(stepId);

      const step = dag.nodes[stepId];
      if (!step) return;

      // Add node
      nodes.push({
        id: step.id,
        type: "StepNode",
        position: {
          x: column * (NODE_PREF.style.width + GRID_SIZE * 2),
          y: row * (NODE_PREF.style.height + GRID_SIZE * 2),
        },
        data: step,
        ...NODE_PREF,
        style: NODE_PREF.style,
      });

      // Add edges and process child nodes
      if (step.dependents)
        step.dependents.forEach((targetId: string, index: number) => {
          edges.push({
            id: `edge-${step.id}-${targetId}`,
            source: step.id,
            target: targetId,
          });
          // Position child nodes in next column, with offset based on index
          positionNode(targetId, column + 1, row + index);
        });

      if (
        step.data.type === "condition" &&
        (step.data.meta as ConditionParams).else
      ) {
        (step.data.meta as ConditionParams).else?.forEach(
          (targetId: string, index: number) => {
            edges.push({
              id: `edge-${step.id}-${targetId}`,
              source: step.id,
              target: targetId,
            });
            positionNode(targetId, column + 1, row + index + 1);
          },
        );
      }
    };

    // Find root nodes (nodes with no incoming edges)
    const rootNodes = Object.values(dag.nodes).filter(
      (step) =>
        !Object.values(dag.nodes).some(
          (s) =>
            s.dependents?.includes(step.id) ||
            (s.data.meta as ConditionParams).else?.includes(step.id),
        ),
    );

    rootNodes.forEach((root, index) => {
      positionNode(root.id, 1, index);
    });

    // Add adapter nodes to the left of the canvas
    adapters.forEach((adapter: Adapter, index: number) => {
      const adapterData: NodeData = {
        id: adapter.id,
        data: adapter,
        name: adapter.name,
      };

      nodes.push({
        ...NODE_PREF,
        id: `adapter-${adapter.id}`,
        type: "AdapterNode",
        position: {
          x: 0,
          y: index * (NODE_PREF.style.height + GRID_SIZE * 2),
        },
        data: adapterData,
        style: NODE_PREF.style,
      });
    });

    set({ nodes, edges, dag });
  },

  initializeNewDAG: (id: string, inputSchema = {}) => {
    const newDAG: DAGModel = {
      id,
      name: id,
      description: "",
      nodes: {},
      inputSchema,
    };

    set({
      dag: newDAG,
      nodes: [],
      edges: [],
      isSheetOpen: false,
      selectedNodeId: null,
    });
  },

  addEdge: (edge: Edge) => {
    get().onEdgesChange([{ type: "add", item: edge }]);
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

  onConnect: (params) => {
    const { onEdgesChange } = get();

    const newEdge = {
      id: `edge-${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
    };
    onEdgesChange([{ type: "add", item: newEdge }]);
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  removeEdge: (edgeId: string) => {
    get().onEdgesChange([{ type: "remove", id: edgeId }]);
  },

  detectCollision: (node) => {
    const { nodes } = get();
    return nodes.some((n) => {
      if (n.id === node.id) return false;
      return (
        Math.abs(n.position.x - node.position.x) < NODE_PREF.style.width &&
        Math.abs(n.position.y - node.position.y) < NODE_PREF.style.height
      );
    });
  },

  wouldCreateCycle: (sourceId: string, targetId: string): boolean => {
    // If we're adding an edge from target to source, it would create a cycle
    if (sourceId === targetId) return true;

    // Create a map of node dependencies
    const graph: Record<string, string[]> = {};
    for (const edge of get().edges) {
      if (!graph[edge.source]) graph[edge.source] = [];
      graph[edge.source].push(edge.target);
    }

    // Add the potential new edge
    if (!graph[sourceId]) graph[sourceId] = [];
    graph[sourceId].push(targetId);

    // Helper function for DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor)) return true;
      }

      recursionStack.delete(node);
      return false;
    };

    // Check for cycles starting from the source node
    return hasCycle(sourceId);
  },

  findAvailablePosition: (position) => {
    const { detectCollision } = get();
    const pos = { ...position };
    let i = 0;
    while (
      detectCollision({
        id: "temp",
        position: pos,
        data: {
          id: crypto.randomUUID(),
          data: {
            type: "query",
            meta: { table: "", where: {}, select: [] },
          },
          name: "",
        },
        ...NODE_PREF,
      })
    ) {
      pos.x = position.x + i * GRID_SIZE;
      pos.y = position.y + i * 40;
      i++;
    }
    return pos;
  },

  addNode: (data) => {
    const { nodes, findAvailablePosition } = get();
    const pos = findAvailablePosition({ x: 0, y: 0 });
    const nodeId = crypto.randomUUID();
    const generatedName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: " ",
      style: "capital",
    });
    const newNode = {
      id: nodeId,
      position: pos,
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
        name:
          (data?.name && data.name.trim().length > 0 ? data.name : generatedName) as string,
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

  openSheet: (nodeId) =>
    set({
      isSheetOpen: true,
      selectedNodeId: nodeId,
    }),
  closeSheet: () => set({ isSheetOpen: false, selectedNodeId: null }),

  getDag: () => {
    const { nodes, dag } = get();
    if (!dag) throw new Error("DAG is not set");

    const nodesRecord: Record<string, Step> = {};
    nodes.forEach((node) => {
      // Skip adapter nodes
      if (
        node.data.data.type === "http_adapter" ||
        node.data.data.type === "schedular_adapter"
      )
        return;

      // Reconstruct Step structure
      const { id, name, dependencies, dependents, data } = node.data;
      nodesRecord[node.id] = {
        id,
        name,
        dependencies,
        dependents,
        data: data as Step["data"],
      };
    });

    return {
      ...dag,
      nodes: nodesRecord,
    } as DAGModel;
  },
}));
