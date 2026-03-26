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
import { ModeToggle } from "@/components/theme-swticher";
import { type NodeData, useFlowStore } from "@/store/flow-store";

import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  History,
  LayoutGrid,
  Plus,
  Rocket,
  Save,
} from "lucide-react";
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
import { GRID_SIZE, STEP_NODE_PREF } from "@/config/node";
import { useDAGMutations } from "@/hooks/dag";
import { detectCollision, findAvailablePosition } from "@/lib/graph";
import AdapterNode from "../../../../components/nodes/adapter-node";
import StepNode from "../../../../components/nodes/step-node";

// Create node types with props
const createNodeTypes = (
  setSelectedNode: (nodeId: string | null) => void,
  removeNode: (id: string) => void,
) => ({
  StepNode: (props: Pick<Node<NodeData>, "data" | "id">) => (
    <StepNode {...props} onEdit={setSelectedNode} removeNode={removeNode} />
  ),
  AdapterNode: (props: Pick<Node<NodeData>, "data" | "id">) => (
    <AdapterNode {...props} onEdit={setSelectedNode} removeNode={removeNode} />
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
  const { publishDAG, updateDAG, createDAG } = useDAGMutations();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {
    nodes,
    edges,
    setNodes,
    addStepNode,
    addAdapterNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    wouldCreateCycle,
    setDAG,
    dag,
    getDag,
    clearDirty,
    setSelectedNode,
    removeNode,
  } = useFlowStore();

  // Create node types with the required functions
  const nodeTypes = useMemo(
    () => createNodeTypes(setSelectedNode, removeNode),
    [setSelectedNode, removeNode],
  );

  const onDragStop: OnNodeDrag<Node<NodeData>> = (
    _event: MouseEvent,
    node: Node<NodeData>,
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
      } as Node<NodeData>,
      STEP_NODE_PREF,
    );
    const position = hasCollision
      ? findAvailablePosition(nodes, newPosition)
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
    if (dag) setDAG(dag);
  }, [dag, setDAG]);

  const handleSave = useCallback(async () => {
    const current = getDag();
    setIsSaving(true);
    try {
      if (current.id) await updateDAG(current.id, current);
      else await createDAG(current);
      clearDirty();
    } catch {
      // toast handled inside mutations
    } finally {
      setIsSaving(false);
    }
  }, [getDag, updateDAG, createDAG, clearDirty]);

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
      nodes={nodes}
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
            <DropdownMenuItem onClick={() => addStepNode()}>
              Add Step
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => addAdapterNode()}>
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
      <Panel position="top-right" className="flex items-center gap-2">
        <ModeToggle />
        <Button onClick={handleSave} disabled={isSaving || !dag?.id}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </Panel>
      <Controls />
      <Background gap={GRID_SIZE} offset={GRID_SIZE} />
    </ReactFlow>
  );
}
