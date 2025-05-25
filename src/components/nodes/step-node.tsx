import { memo } from "react";
import { Handle, Position, Node } from "@xyflow/react";
import { PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NodeData } from "@/store/flow-store";

interface StepNodeProps extends Pick<Node<NodeData>, "data" | "id"> {
  onEdit: (id: string) => void;
  removeNode: (id: string) => void;
}

const StepNode = ({ data, id, onEdit, removeNode }: StepNodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="flex h-full items-center justify-between rounded border bg-background p-2">
        <div className="flex flex-col overflow-hidden">
          <p className="font-medium truncate">{data.name}</p>
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

export default memo(StepNode);
