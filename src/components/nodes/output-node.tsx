import { Handle, type Node, Position } from "@xyflow/react";
import { LogOut, PencilLine } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { NODE_PREF } from "@/config/node";
import type { NodeData } from "@/store/flow-store";

const iconSize = "h-4 w-4";

interface OutputNodeProps extends Pick<Node<NodeData>, "data" | "id"> {
  onEdit: (id: string) => void;
}

const OutputNode = ({ data, id, onEdit }: OutputNodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        style={{
          width: NODE_PREF.style.width,
          height: NODE_PREF.style.height,
        }}
        className="flex flex-col rounded-lg border-2 border-amber-400/40 dark:border-amber-500/40 bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-950/20 dark:to-amber-900/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        {/* Top row: Name and action */}
        <div className="flex items-center justify-between px-2.5 pt-2 pb-1 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <LogOut
              className={`${iconSize} text-amber-600 dark:text-amber-400 flex-shrink-0`}
            />
            <p className="font-semibold truncate text-sm">
              {data.name || "Output"}
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
          <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium truncate opacity-70">
            Output Node
          </p>
        </div>
      </div>
    </>
  );
};

export default memo(OutputNode);
