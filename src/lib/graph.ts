import type { Edge, Node } from "@xyflow/react";
import type { z } from "zod";
import type { stepSchema } from "@/components/forms/step-form";
import { GRID_SIZE, STEP_NODE_PREF, STEP_NODE_SPACING } from "@/config/node";
import type { Step } from "@/hooks/dag";

export type NodeDataBase = {
  id: string;
  dependencies?: string[];
  dependents?: string[];
  name: string;
  data: unknown;
};

export type NodeData = z.infer<typeof stepSchema>;
export type INode = {
  id: string;
  position: { x: number; y: number };
};
export type IEdge = {
  id: string;
  source: INode["id"];
  target: INode["id"];
};
// Edge helpers
export const edgeId = (source: string, target: string): string =>
  `edge-${source}-${target}`;

export const hasEdge = (
  edges: IEdge[],
  source: IEdge["source"],
  target: IEdge["target"],
): boolean => edges.some((e) => e.id === edgeId(source, target));

export const createEdge = <T extends IEdge>(
  source: T["source"],
  target: T["target"],
  base?: Omit<T, keyof IEdge>,
): T =>
  ({
    ...(base || {}),
    id: edgeId(source, target),
    source,
    target,
  }) as T;

export const wouldCreateCycleOnAdd = (
  edges: IEdge[],
  sourceId: string,
  targetId: string,
): boolean => {
  if (sourceId === targetId) return true;
  const graph: Record<string, string[]> = {};
  for (const e of edges) {
    if (!graph[e.source]) graph[e.source] = [];
    graph[e.source].push(e.target);
  }
  if (!graph[sourceId]) graph[sourceId] = [];
  graph[sourceId].push(targetId);

  const visited = new Set<string>();
  const stack = new Set<string>();

  const dfs = (node: string): boolean => {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);
    for (const n of graph[node] || []) {
      if (dfs(n)) return true;
    }
    stack.delete(node);
    return false;
  };

  return dfs(sourceId);
};

// Collision and positioning
export const detectCollision = <T extends INode>(
  nodes: T[],
  node: T,
  nodePref: typeof STEP_NODE_PREF = STEP_NODE_PREF,
): boolean => {
  return nodes.some((n) => {
    if (n.id === node.id) return false;
    return (
      Math.abs(n.position.x - node.position.x) < nodePref.style.width &&
      Math.abs(n.position.y - node.position.y) < nodePref.style.height
    );
  });
};

export const findAvailablePosition = <T extends INode>(
  nodes: T[],
  position: T["position"],
  scanDirection: "horizontal" | "vertical" | "diagonal" = "diagonal",
  nodePref: typeof STEP_NODE_PREF = STEP_NODE_PREF,
): T["position"] => {
  const pos = { ...position };
  let i = 0;
  while (
    detectCollision<T>(nodes, {
      id: "temp",
      position: pos,
    } as T)
  ) {
    if (scanDirection === "horizontal") {
      pos.x = position.x + i * GRID_SIZE;
    } else if (scanDirection === "vertical") {
      pos.y = position.y + i * (nodePref.style.height + STEP_NODE_SPACING);
    } else {
      pos.x = position.x + i * GRID_SIZE;
      pos.y = position.y + i * (nodePref.style.height + STEP_NODE_SPACING);
    }
    i++;
  }
  return pos;
};

// Build graph from DAG + adapters
export const buildGraphFromDag = <T extends NodeDataBase>(
  nodesData: T[],
  nodeType: "StepNode" | "AdapterNode" | "TableNode",
  startPosition: [number, number] = [0, 0], // [row, column]
  nodePref: typeof STEP_NODE_PREF = STEP_NODE_PREF,
): { nodes: Node<T>[]; edges: Edge[] } => {
  const [row, column] = startPosition;
  const nodes: Node<T>[] = [];
  const edges: Edge[] = [];
  const visited = new Set<string>();
  const edgeSet = new Set<string>();

  const positionNode = (stepId: string, column: number, row: number): void => {
    if (visited.has(stepId)) return;
    visited.add(stepId);

    const step = nodesData.find((s) => s.id === stepId);
    if (!step) return;
    step.dependents = nodesData
      .filter((s) => s.dependencies?.includes(step.id))
      .map((s) => s.id);

    nodes.push({
      id: step.id,
      type: nodeType,
      position: {
        x: column * (nodePref.style.width + STEP_NODE_SPACING),
        y: row * (nodePref.style.height + STEP_NODE_SPACING),
      },
      data: step as unknown as T,
      ...nodePref,
      style: nodePref.style,
    });

    const dependents = nodesData.filter((s) =>
      s.dependencies?.includes(step.id),
    );

    if (dependents.length > 0) {
      dependents.forEach((dependent: T, index: number) => {
        const id = edgeId(step.id, dependent.id);
        if (!edgeSet.has(id)) {
          edgeSet.add(id);
          edges.push(createEdge(step.id, dependent.id));
        }
        positionNode(dependent.id, column + 1, row + index);
      });
    }
  };

  const rootNodes = nodesData.filter(
    (s) => !s.dependencies || !s.dependencies.length,
  );
  rootNodes.forEach((root, index) => {
    positionNode(root.id, column, row + index);
  });

  return { nodes, edges };
};

// Extract DAG from current nodes
export const reconstructNodes = (
  nodes: Node<NodeData>[],
): Record<string, Step> => {
  const nodesRecord: Record<string, Step> = {};
  nodes.forEach((node) => {
    if (node.type !== "StepNode") return;
    const { id, name, dependencies, data, createdAt } = node.data;
    nodesRecord[node.id] = {
      id,
      name,
      createdAt,
      dependencies,
      data: data as Step["data"],
    };
  });
  return nodesRecord;
};

// Keep node relations in sync when edges change
export const syncNodesOnEdgeAdd = <T extends NodeDataBase>(
  nodes: Node<T>[],
  source: string,
  target: string,
): Node<T>[] => {
  return nodes.map((n) => {
    if (n.id === source && n.type === "StepNode") {
      const deps = Array.from(
        new Set([...(n.data.dependencies || []), target]),
      );
      return { ...n, data: { ...n.data, dependencies: deps } };
    }
    if (n.id === target && n.type === "StepNode") {
      const dependents = Array.from(
        new Set([...(n.data.dependents || []), source]),
      );
      return { ...n, data: { ...n.data, dependents } };
    }
    return n;
  });
};

export const syncNodesOnEdgeRemove = <T extends NodeDataBase>(
  nodes: Node<T>[],
  source: string,
  target: string,
): Node<T>[] => {
  return nodes.map((n) => {
    if (n.id === source && n.type === "StepNode") {
      const deps = (n.data.dependencies || []).filter((d) => d !== target);
      return { ...n, data: { ...n.data, dependencies: deps } };
    }
    if (n.id === target && n.type === "StepNode") {
      const dependents = (n.data.dependents || []).filter((d) => d !== source);
      return { ...n, data: { ...n.data, dependents } };
    }
    return n;
  });
};
