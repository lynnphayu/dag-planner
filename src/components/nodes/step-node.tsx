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
  Play,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { NODE_PREF } from "@/config/node";
import type { NodeData } from "@/store/flow-store";
import type { Adapter, DAGModel } from "@/hooks/dag";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExecuteAdapterForm } from "@/components/forms/execute-adapter-form";

interface StepNodeProps extends Pick<Node<NodeData>, "data" | "id"> {
  onEdit: (id: string) => void;
  removeNode: (id: string) => void;
  dag?: DAGModel | null;
}
const iconSize = "h-4 w-4";

const StepNode = ({ data, id, onEdit, removeNode }: StepNodeProps) => {
  // Determine styling based on node type
  const isAdapter = data.data.type.includes("adapter");
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const adapterData = useMemo(() => {
    if (!isAdapter) return null;
    // Node id for adapters is "adapter-<adapter.id>", actual adapter id is in data.id
    // Cast to Adapter to access input metadata if available from API
    return { ...(data.data as unknown as Adapter), id: data.id } as Adapter;
  }, [isAdapter, data]);

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
  const getTypeName = () => {
    return data.data.type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get color scheme based on type
  const getColorScheme = () => {
    if (isAdapter) {
      return {
        border: "border-indigo-500/50",
        bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20",
        text: "text-indigo-700 dark:text-indigo-300",
        icon: "text-indigo-600 dark:text-indigo-400",
      };
    }
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
      {!isAdapter && <Handle type="target" position={Position.Left} />}
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
            <p className="font-semibold truncate text-sm">{data.name}</p>
          </div>
          <div className="flex gap-0.5 flex-shrink-0">
            {isAdapter && (
              <Dialog open={isExecuteOpen} onOpenChange={setIsExecuteOpen}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hover:bg-accent hover:text-accent-foreground rounded size-6`}
                  onClick={() => setIsExecuteOpen(true)}
                  title="Execute"
                >
                  <Play className={iconSize} />
                </Button>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Execute Adapter</DialogTitle>
                  </DialogHeader>
                  {adapterData && (
                    <ExecuteAdapterForm

                      adapter={adapterData}
                      onCancel={() => setIsExecuteOpen(false)}
                      onSuccess={() => setIsExecuteOpen(false)}
                    />
                  )}
                </DialogContent>
              </Dialog>
            )}
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

        {/* Bottom row: Type badge */}
        <div className="px-2.5 pb-2">
          <p
            className={`text-[10px] ${colors.text} font-medium truncate opacity-70`}
          >
            {getTypeName()}
          </p>
        </div>
      </div>
      {!isAdapter && <Handle type="source" position={Position.Right} />}
    </>
  );
};

export default memo(StepNode);
