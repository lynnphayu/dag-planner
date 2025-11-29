import type { Edge, Node } from "@xyflow/react";
import type { z } from "zod";
import type { ConditionParamsSchema, stepSchema } from "@/components/forms/step-form";
import { GRID_SIZE, NODE_PREF } from "@/config/node";
import type { Adapter, DAGModel, Step } from "@/hooks/dag";

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
): boolean => {
  return nodes.some((n) => {
    if (n.id === node.id) return false;
    return (
      Math.abs(n.position.x - node.position.x) < NODE_PREF.style.width &&
      Math.abs(n.position.y - node.position.y) < NODE_PREF.style.height
    );
  });
};

export const findAvailablePosition = <T extends INode>(
  nodes: T[],
  position: T["position"],
): T["position"] => {
  const pos = { ...position };
  let i = 0;
  while (
    detectCollision<T>(nodes, {
      id: "temp",
      position: pos,
    } as T)
  ) {
    pos.x = position.x + i * GRID_SIZE;
    pos.y = position.y + i * (GRID_SIZE * 2);
    i++;
  }
  return pos;
};

// Build graph from DAG + adapters
export const buildGraphFromDag = <GRAPH extends DAGModel>(
  dag: GRAPH,
  adapters: Adapter[] = [],
): { nodes: Node<NodeData>[]; edges: Edge[] } => {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  const visited = new Set<string>();
  const edgeSet = new Set<string>();

  const positionNode = (stepId: string, column: number, row: number): void => {
    if (visited.has(stepId)) return;
    visited.add(stepId);

    const step = dag.nodes[stepId];
    if (!step) return;

    nodes.push({
      id: step.id,
      type: "StepNode",
      position: {
        x: column * (NODE_PREF.style.width + GRID_SIZE * 2),
        y: row * (NODE_PREF.style.height + GRID_SIZE * 2),
      },
      data: step as unknown as NodeData,
      ...NODE_PREF,
      style: NODE_PREF.style,
    });

    if (step.dependents)
      step.dependents.forEach((targetId: string, index: number) => {
        const id = edgeId(step.id, targetId);
        if (!edgeSet.has(id)) {
          edgeSet.add(id);
          edges.push(createEdge(step.id, targetId));
        }
        positionNode(targetId, column + 1, row + index);
      });

    if (step.data.type === "condition" && step.data.meta.else) {
      (step.data.meta.else?.forEach(
        (targetId: string, index: number) => {
          const id = edgeId(step.id, targetId);
          if (!edgeSet.has(id)) {
            edgeSet.add(id);
            edges.push(createEdge(step.id, targetId));
          }
          positionNode(targetId, column + 1, row + index + 1);
        },
      ));
    }
  };

  const rootNodes = Object.values(dag.nodes).filter(
    (step) =>
      !Object.values(dag.nodes).some(
        (s) =>
          s.dependents?.includes(step.id) ||
          (s.data.meta as z.infer<typeof ConditionParamsSchema>['meta']).else?.includes(step.id),
      ),
  );
  rootNodes.forEach((root, index) => {
    positionNode(root.id, 1, index);
  });

  adapters.forEach((adapter: Adapter, index: number) => {
    const adapterData: NodeData = {
      id: adapter.id,
      data: adapter,
      name: adapter.name,
    } as unknown as NodeData;
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

  return { nodes, edges };
};

// Extract DAG from current nodes
export const reconstructNodes = (
  nodes: Node<NodeData>[],
): Record<string, Step> => {
  const nodesRecord: Record<string, Step> = {};
  nodes.forEach((node) => {
    if (node.type !== "StepNode") return;
    const { id, name, dependencies, dependents, data } = node.data;
    nodesRecord[node.id] = {
      id,
      name,
      dependencies,
      dependents,
      data: data as Step["data"],
    };
  });
  return nodesRecord;
};

// Keep node relations in sync when edges change
export const syncNodesOnEdgeAdd = (
  nodes: Node<NodeData>[],
  source: string,
  target: string,
): Node<NodeData>[] => {
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

export const syncNodesOnEdgeRemove = (
  nodes: Node<NodeData>[],
  source: string,
  target: string,
): Node<NodeData>[] => {
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
