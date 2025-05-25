import { memo } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { NodeData, useFlowStore } from "@/store/flow-store";
import { Button } from "./ui/button";
import { PencilLine } from "lucide-react";

const OutputNode = ({ data, id }: Pick<Node<NodeData>, "data" | "id">) => {
  const { openSheet } = useFlowStore();
  return (
    <>
      <div className="flex h-full items-center justify-between rounded border p-2">
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
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(OutputNode);
