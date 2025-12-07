import { Handle, type Node, Position } from "@xyflow/react";
import {
  Calendar,
  Database,
  Filter,
  FunctionSquare,
  GitBranch,
  GitMerge,
  Globe,
  PencilLine,
  SquarePlus,
  Trash2,
  Zap,
} from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { NODE_PREF } from "@/config/node";
import type { NodeData } from "@/store/flow-store";

interface StepNodeProps extends Pick<Node<NodeData>, "data" | "id"> {
  onEdit: (id: string) => void;
  removeNode: (id: string) => void;
}
const iconSize = "h-4 w-4";

const StepNode = ({ data, id, onEdit, removeNode }: StepNodeProps) => {
  // Non-adapter step node

  // Get icon based on type
  const getIcon = () => {
    const type = data.data.type;

    switch (type) {
      case "query":
        return <Database className={iconSize} />;
      case "insert":
        return <SquarePlus className={iconSize} />;
      case "update":
        return <PencilLine className={iconSize} />;
      case "delete":
        return <Trash2 className={iconSize} />;
      case "join":
        return <GitMerge className={iconSize} />;
      case "filter":
        return <Filter className={iconSize} />;
      case "map":
        return <FunctionSquare className={iconSize} />;
      case "condition":
        return <GitBranch className={iconSize} />;
      case "http":
        return <Globe className={iconSize} />;
      case "http_adapter":
        return <Globe className={iconSize} />;
      case "schedular_adapter":
        return <Calendar className={iconSize} />;
      default:
        return <Zap className={iconSize} />;
    }
  };

  // Get styled type name
  // const getTypeName = () => {
  //   return data.data.type
  //     .split("-")
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(" ");
  // };

  // Get color scheme based on type
  const getColorScheme = () => {
    return {
      border: "border-slate-300/60 dark:border-slate-600/40",
      bg: "bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-slate-900/20 dark:to-slate-800/30",
      text: "text-slate-600 dark:text-slate-400",
      icon: "text-slate-500 dark:text-slate-400",
    };
  };

  const colors = getColorScheme();

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        style={{
          width: NODE_PREF.style.width,
          height: NODE_PREF.style.height,
        }}
        className={`flex flex-col rounded-lg border-2 ${colors.border} ${colors.bg} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
      >
        {/* Top row: Name and actions */}
        <div className="flex items-center justify-between px-2.5 pt-2 pb-1 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`${colors.icon} flex-shrink-0`}>{getIcon()}</div>
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

        {/* Name row: moved under logos */}
        <div className="px-2.5 pb-1">
          <p className="font-semibold truncate text-sm">{data.name}</p>
        </div>

        {/* Bottom row: Type badge */}
        {/* <div className="px-2.5 pb-2">
          <p
            className={`text-[10px] ${colors.text} font-medium truncate opacity-70`}
          >
            {getTypeName()}
          </p>
        </div> */}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(StepNode);
