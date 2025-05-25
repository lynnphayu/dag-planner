import { memo } from "react";
import { Handle, Position, Node } from "@xyflow/react";
import { PencilLine, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { NodeData, useFlowStore } from "@/store/flow-store";

const CustomNode = ({ data, id }: Pick<Node<NodeData>, "data" | "id">) => {
  const { openSheet, removeNode } = useFlowStore();

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="flex h-full items-center justify-between rounded border bg-background p-2">
        <p className="overflow-hidden  whitespace-nowrap">{data.id}</p>
        <div className="flex flex-col h-full justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground w-6 h-6"
            onClick={() => openSheet(id)}
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground w-6 h-6"
            onClick={() => removeNode(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(CustomNode);
