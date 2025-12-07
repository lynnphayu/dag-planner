"use client";

import {
  Background,
  type ColorMode,
  Controls,
  type Node,
  type OnConnect,
  type OnNodeDrag,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import { type NodeData, useFlowStore } from "@/store/flow-store";

import "@xyflow/react/dist/style.css";
import { ArrowLeft, History, LayoutGrid, Plus, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { type MouseEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GRID_SIZE } from "@/config/node";
import { useDAGMutations } from "@/hooks/dag";
import AdapterNode from "../../../../components/nodes/adapter-node";
import StepNode from "../../../../components/nodes/step-node";

// Create node types with props
const createNodeTypes = (
  setSelectedNodeId: (nodeId: string) => void,
  removeNode: (id: string) => void,
) => ({
  StepNode: (props: Pick<Node<NodeData>, "data" | "id">) => (
    <StepNode {...props} onEdit={setSelectedNodeId} removeNode={removeNode} />
  ),
  AdapterNode: (props: Pick<Node<NodeData>, "data" | "id">) => (
    <AdapterNode
      {...props}
      onEdit={setSelectedNodeId}
      removeNode={removeNode}
    />
  ),
});

interface FlowComponentProps {
  onOpenVersions?: () => void;
  canOpenVersions?: boolean;
}

export function FlowComponent({
  onOpenVersions,
  canOpenVersions = true,
}: FlowComponentProps = {}) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { publishDAG } = useDAGMutations();
  const [isPublishing, setIsPublishing] = useState(false);
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
    setSelectedNodeId,
    removeNode,
  } = useFlowStore();

  // Create node types with the required functions
  const nodeTypes = useMemo(
    () => createNodeTypes(setSelectedNodeId, removeNode),
    [setSelectedNodeId, removeNode],
  );

  const onDragStop: OnNodeDrag<Node<NodeData>> = (
    _event: MouseEvent,
    node: Node<NodeData>,
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
    [wouldCreateCycle, onConnect, t],
  );

  const handleReposition = useCallback(() => {
    if (dag) setDAG(dag); // Adapters come with the DAG payload
  }, [dag, setDAG]);

  const handlePublish = useCallback(async () => {
    if (!dag?.id) {
      toast.error("No DAG to publish");
      return;
    }
    setIsPublishing(true);
    try {
      await publishDAG(dag.id);
    } catch {
      // toast handled inside publishDAG
    } finally {
      setIsPublishing(false);
    }
  }, [dag?.id, publishDAG]);

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
    >
      <Panel position="top-left" className="flex gap-2">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          title="Back to DAG List"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => addNode()}>
              Add Step
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                addNode({
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
                  name: "New Adapter",
                })
              }
            >
              Add Adapter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={handleReposition}>
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button onClick={handlePublish} disabled={isPublishing || !dag?.id}>
          <Rocket className="h-4 w-4 mr-2" />
          {isPublishing ? "Publishing..." : "Publish"}
        </Button>
        <Button
          variant="outline"
          onClick={() => onOpenVersions?.()}
          disabled={!dag?.id || !onOpenVersions || !canOpenVersions}
          title="View DAG Versions"
        >
          <History className="h-4 w-4 mr-2" />
          Versions
        </Button>
      </Panel>
      <Controls />
      <Background gap={GRID_SIZE} offset={GRID_SIZE} />
    </ReactFlow>
  );
}
