"use client";

import {
  type ColorMode,
  Controls,
  type Node,
  type OnNodeDrag,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import {
  type NodeData,
  type TableNodeData,
  useTableStore,
} from "@/store/flow-store";

import "@xyflow/react/dist/style.css";
import { LayoutGrid } from "lucide-react";
import { useTheme } from "next-themes";
import { type MouseEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { GRID_SIZE, TABLE_NODE_PREF } from "@/config/node";
import { detectCollision, findAvailablePosition } from "@/lib/graph";
import TableNode from "../../../../components/nodes/table-node";

// Create node types with props
const createNodeTypes = (
  setSelectedNodeId: (nodeId: string) => void,
  removeNode: (id: string) => void,
) => ({
  TableNode: (props: Pick<Node<NodeData>, "data" | "id">) => (
    <TableNode {...props} onEdit={setSelectedNodeId} removeNode={removeNode} />
  ),
});

export function DBEditor() {
  const { theme } = useTheme();
  const { nodes, edges, setNodes, onNodesChange, onEdgesChange } =
    useTableStore();

  const nodeTypes = useMemo(
    () =>
      createNodeTypes(
        () => {},
        () => {},
      ),
    [],
  );

  const onDragStop: OnNodeDrag<Node<TableNodeData>> = (
    _event: MouseEvent,
    node: Node<TableNodeData>,
  ) => {
    const newPosition = {
      x: Math.round(node.position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(node.position.y / GRID_SIZE) * GRID_SIZE,
    };

    const hasCollision = detectCollision(
      nodes,
      {
        ...node,
        position: newPosition,
      } as Node<TableNodeData>,
      TABLE_NODE_PREF,
    );
    const position = hasCollision
      ? findAvailablePosition(nodes, newPosition)
      : newPosition;

    setNodes(nodes.map((n) => (n.id === node.id ? { ...n, position } : n)));
  };

  return (
    <ReactFlow
      colorMode={(theme || "dark") as ColorMode}
      nodeTypes={nodeTypes}
      edges={edges}
      onNodeDragStop={onDragStop}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodesDraggable={true}
      proOptions={{
        hideAttribution: true,
      }}
      fitView={true}
      fitViewOptions={{ maxZoom: 1 }}
      defaultEdgeOptions={{
        style: {
          strokeWidth: 2,
          stroke: "var(--foreground)",
        },
        animated: true,
        // className: "transition-all ease-in-out duration-200 will-change-[d] [&.dragging]:!transition-none",
      }}
      nodes={nodes}
    >
      <Panel position="top-left" className="flex gap-2">
        <Button onClick={() => {}}>
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </Panel>
      <Controls />
      {/* <Background gap={GRID_SIZE} offset={GRID_SIZE} /> */}
    </ReactFlow>
  );
}
