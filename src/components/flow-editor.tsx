"use client";

import { NodeData, useFlowStore } from "@/store/flow-store";
import {
  Background,
  ColorMode,
  Controls,
  Node,
  OnConnect,
  OnNodeDrag,
  Panel,
  ReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Plus, LayoutGrid } from "lucide-react";
import CustomNode from "./custom-node";
import InputNode from "./input-node";
import OutputNode from "./output-node";
import { MouseEvent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { GRID_SIZE } from "@/config/api";

const nodeTypes = {
  CustomNode: CustomNode,
  InputNode: InputNode,
  OutputNode: OutputNode,
};

export function FlowComponent() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const {
    nodes,
    edges,
    setNodes,
    detectCollision,
    findAvailablePosition,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    wouldCreateCycle,
    setDAG,
    dag,
    getNodes,
  } = useFlowStore();

  const onDragStop: OnNodeDrag<Node<NodeData>> = (
    event: MouseEvent,
    node: Node<NodeData>
  ) => {
    const newPosition = {
      x: Math.round(node.position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(node.position.y / GRID_SIZE) * GRID_SIZE,
    };

    const hasCollision = detectCollision({ ...node, position: newPosition });
    const position = hasCollision
      ? findAvailablePosition(newPosition)
      : newPosition;

    setNodes(nodes.map((n) => (n.id === node.id ? { ...n, position } : n)));
  };

  // Create a memoized version of onConnectProxy to prevent recreating on every render
  const onConnectProxy = useCallback<OnConnect>(
    (connection) => {
      if (wouldCreateCycle(connection.source, connection.target)) {
        toast.error(t("message.cycle_detected.title"), {
          description: t("message.cycle_detected.description"),
        });
      } else {
        onConnect(connection);
      }
    },
    [wouldCreateCycle, onConnect, t]
  );

  const handleReposition = useCallback(() => {
    if (dag) setDAG(dag);
  }, [dag, setDAG]);

  return (
    <ReactFlow
      colorMode={(theme || "dark") as ColorMode}
      nodes={getNodes()}
      edges={edges}
      onNodeDragStop={onDragStop}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnectProxy}
      nodeTypes={nodeTypes}
      nodesDraggable={true}
      fitView={true}
      fitViewOptions={{ maxZoom: 1 }}
      defaultEdgeOptions={{
        style: {
          strokeWidth: 2,
          stroke: "var(--border)",
        },
        animated: true,
      }}
    >
      <Panel position="top-left" className="flex gap-2">
        <Button onClick={addNode}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button onClick={handleReposition}>
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </Panel>
      <Controls />
      <Background gap={20} offset={20} />
    </ReactFlow>
  );
}
