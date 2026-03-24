import {
  applyNodeChanges,
  Handle,
  type Node,
  type NodeDimensionChange,
  Position,
  useNodeId,
  useReactFlow,
} from "@xyflow/react";
import { Database, PencilLine, Trash2 } from "lucide-react";
import { memo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TABLE_NODE_PREF } from "@/config/node";
import type { NodeData } from "@/store/flow-store";

interface TableNodeProps extends Pick<Node<NodeData>, "data" | "id"> {
  onEdit: (id: string) => void;
  removeNode: (id: string) => void;
}

const iconSize = "h-4 w-4";

const TableNode = ({ data, id, onEdit, removeNode }: TableNodeProps) => {
  const nodeId = useNodeId();
  const reactFlowInstance = useReactFlow();
  const contentRef = useRef<HTMLDivElement>(null);

  // Color scheme for SQL table nodes
  const colors = {
    border: "border-cyan-500/50 dark:border-cyan-400/50",
    bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/60 dark:from-cyan-950/30 dark:to-cyan-900/20",
    text: "text-cyan-700 dark:text-cyan-300",
    icon: "text-cyan-600 dark:text-cyan-400",
  };

  // Measure content and update node height when content changes
  useEffect(() => {
    if (contentRef.current && nodeId) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        const height = contentRef.current?.offsetHeight;
        const width = contentRef.current?.offsetWidth;
        if (height && width && reactFlowInstance) {
          const nodes = reactFlowInstance.getNodes();
          const dimensionChange: NodeDimensionChange = {
            id: nodeId,
            type: "dimensions",
            dimensions: { width, height },
          };
          reactFlowInstance.setNodes(
            applyNodeChanges([dimensionChange], nodes),
          );
        }
      });
    }
  }, [nodeId, reactFlowInstance, data.name]);

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        ref={contentRef}
        style={{
          width: TABLE_NODE_PREF.style.width,
        }}
        className={`flex flex-col rounded-lg border-2 ${colors.border} ${colors.bg} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
      >
        <div className="flex items-center justify-between px-2.5 pt-2 pb-1 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`${colors.icon} flex-shrink-0`}>
              <Database className={iconSize} />
            </div>
          </div>
          <div className="flex gap-0.5 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={`hover:bg-accent hover:text-accent-foreground rounded size-6`}
              onClick={() => onEdit(id)}
            >
              <PencilLine className={iconSize} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`hover:bg-destructive/10 hover:text-destructive rounded size-6`}
              onClick={() => removeNode(id)}
            >
              <Trash2 className={iconSize} />
            </Button>
          </div>
        </div>

        <div className="px-2.5 pb-2">
          <p className="font-semibold truncate text-sm">{data.name}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(TableNode);
