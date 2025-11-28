import { Handle, type Node, Position } from "@xyflow/react";
import { LogIn, PencilLine } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { NODE_PREF } from "@/config/node";
import type { NodeData } from "@/store/flow-store";

const iconSize = "h-4 w-4";

interface InputNodeProps extends Pick<Node<NodeData>, "data" | "id"> {
  onEdit: (id: string) => void;
}

const InputNode = ({ data, id, onEdit }: InputNodeProps) => {
  return (
    <>
      <div
        style={{
          width: NODE_PREF.style.width,
          height: NODE_PREF.style.height,
        }}
        className="flex flex-col rounded-lg border-2 border-emerald-400/40 dark:border-emerald-500/40 bg-gradient-to-br from-emerald-50 to-emerald-100/80 dark:from-emerald-950/20 dark:to-emerald-900/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        {/* Top row: Name and action */}
        <div className="flex items-center justify-between px-2.5 pt-2 pb-1 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <LogIn
              className={`${iconSize} text-emerald-600 dark:text-emerald-400 flex-shrink-0`}
            />
            <p className="font-semibold truncate text-sm">
              {data.name || "Input"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`hover:bg-accent hover:text-accent-foreground rounded size-6`}
            onClick={() => onEdit(id)}
          >
            <PencilLine className={iconSize} />
          </Button>
        </div>

        {/* Bottom row: Type */}
        <div className="px-2.5 pb-2">
          <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium truncate opacity-70">
            Input Node
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(InputNode);
