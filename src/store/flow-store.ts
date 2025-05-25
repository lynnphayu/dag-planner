import { create } from "zustand";
import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesChange,
} from "@xyflow/react";
import { z } from "zod";

import { ConditionParams, DAGModel } from "@/hooks/use-dag";
import { GRID_SIZE, NODE_PREF } from "@/config/node";
import {
  InputParamsSchema,
  stepSchema,
  StepType,
} from "@/components/forms/step-form";
export type NodeData = z.infer<typeof stepSchema>;

interface FlowState {
  dag: DAGModel | null;
  getDag: () => DAGModel | null;
  setDAG: (dag: DAGModel) => void;
  nodes: Node<NodeData>[];
  edges: { id: string; source: string; target: string }[];
  isSheetOpen: boolean;
  selectedNodeId: string | null;
  selectedNode: Node<NodeData> | null;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: { id: string; source: string; target: string }[]) => void;
  addNode: () => void;
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
  selectedNode: null,
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
    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];
    const visited = new Set<string>();

    const positionNode = (
      stepId: string,
      column: number,
      row: number
    ): void => {
      if (visited.has(stepId)) return;
      visited.add(stepId);

      const step = dag.steps.find((s) => s.id === stepId);
      if (!step) return;

      // Add node
      nodes.push({
        id: step.id,
        position: {
          x: column * (NODE_PREF.style.width + GRID_SIZE * 2),
          y: row * (NODE_PREF.style.height + GRID_SIZE * 2),
        },
        data: step as NodeData,
        ...NODE_PREF,
        style: NODE_PREF.style,
      });

      // Add edges and process child nodes
      if (step.then)
        step.then.forEach((targetId, index) => {
          edges.push({
            id: `edge-${step.id}-${targetId}`,
            source: step.id,
            target: targetId,
          });
          // Position child nodes in next column, with offset based on index
          positionNode(targetId, column + 1, row + index);
        });

      if (step.type === "condition" && (step as ConditionParams).else) {
        (step as ConditionParams).else?.forEach((targetId, index) => {
          edges.push({
            id: `edge-${step.id}-${targetId}`,
            source: step.id,
            target: targetId,
          });
          positionNode(targetId, column + 1, row + index + 1);
        });
      }
    };

    // Find root nodes (nodes with no incoming edges)
    const rootNodes = dag.steps.filter(
      (step) =>
        !dag.steps.some(
          (s) =>
            s.then?.includes(step.id) ||
            (s as ConditionParams).else?.includes(step.id)
        )
    );

    rootNodes.forEach((root, index) => {
      positionNode(root.id, 1, index);
    });
    const newNodes: Node<NodeData>[] = [
      {
        id: "input",
        position: { x: 0, y: 0 },
        data: {
          id: "input",
          type: "input",
          schema: dag.inputSchema,
        } as NodeData,
        ...NODE_PREF,
        type: "InputNode" as string | undefined,
        style: {
          ...NODE_PREF.style,
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        },
      },
      // {
      //   id: "output",
      //   position: {
      //     x: 0,
      //     y: NODE_PREF.style.height + GRID_SIZE * 2,
      //   },
      //   data: {
      //     id: "output",
      //     type: "output",
      //     schema: dag.outputSchema,
      //   } as NodeData,
      //   ...NODE_PREF,
      //   type: "OutputNode" as string | undefined,
      //   style: {
      //     ...NODE_PREF.style,
      //     backgroundColor: "var(--primary)",
      //     color: "var(--primary-foreground)",
      //   },
      // },
    ];
    newNodes.push(...nodes);

    set({ nodes: newNodes, edges, dag });
  },

  addEdge: (edge: Edge) => {
    get().onEdgesChange([{ type: "add", item: edge }]);
  },

  updateNode: (nodeId: string, data: NodeData) => {
    const { nodes, dag } = get();
    const newNodes = nodes.map((n) => (n.id === nodeId ? { ...n, data } : n));
    const newSteps = dag?.steps.map((step) =>
      step.id === nodeId ? { ...step, ...data } : step
    );
    set({
      nodes: newNodes,
      dag: { ...dag, steps: newSteps } as DAGModel,
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
    get().edges.forEach((edge) => {
      if (!graph[edge.source]) graph[edge.source] = [];
      graph[edge.source].push(edge.target);
    });

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
          table: "",
          name: "",
          type: "query",
          select: [],
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

  addNode: () => {
    const { nodes, findAvailablePosition } = get();
    const pos = findAvailablePosition({ x: 0, y: 0 });
    const newNode = {
      id: `new-${nodes.length}`,
      position: pos,
      data: {
        id: crypto.randomUUID(),
        table: "",
        name: "",
        type: StepType.enum.query,
        select: [],
      },
      ...NODE_PREF,
    };
    set({ nodes: [...nodes, newNode] });
  },
  removeNode: (nodeId: string) => {
    const { nodes, edges } = get();
    const newNodes = nodes.filter((n) => n.id !== nodeId);
    const newEdges = edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    );
    set({ nodes: newNodes, edges: newEdges });
  },

  openSheet: (nodeId) =>
    set({
      isSheetOpen: true,
      selectedNodeId: nodeId,
      selectedNode: get().nodes.find((n) => n.id === nodeId),
    }),
  closeSheet: () => set({ isSheetOpen: false, selectedNodeId: null }),

  getDag: () => {
    const { nodes, dag } = get();
    if (!dag) throw new Error("DAG is not set");
    const inputNode = nodes.find((n) => n.id === "input");
    // const outputNode = nodes.find((n) => n.id === "output");
    return {
      id: dag.id,
      steps: nodes
        .filter((n) => n.id !== "input")
        .map((n) => n.data) as NodeData[],
      inputSchema: inputNode?.data
        ? (inputNode.data as z.infer<typeof InputParamsSchema>).schema
        : undefined,
      // outputSchema: outputNode?.data
      //   ? (outputNode.data as z.infer<typeof OutputPramsSchema>).schema
      //   : undefined,
    } as DAGModel;
  },
}));
