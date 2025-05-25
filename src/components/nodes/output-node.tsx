import { memo } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { NodeData } from "@/store/flow-store";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";

interface OutputNodeProps extends Pick<Node<NodeData>, "data" | "id"> {
  onEdit: (id: string) => void;
}

const OutputNode = ({ data, id, onEdit }: OutputNodeProps) => {
  return (
    <>
      <div className="flex h-full items-center justify-between rounded border p-2">
        <div className="flex flex-col overflow-hidden">
          <p className="font-medium truncate">{data.name || "Output"}</p>
          <p className="text-xs text-muted-foreground truncate">{data.id}</p>
        </div>
        <div className="flex flex-col h-full justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground w-6 h-6"
            onClick={() => onEdit(id)}
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
