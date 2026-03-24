import type { Node } from "@xyflow/react";
import { Calendar, Globe, PencilLine, Play, Trash2, Zap } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { ExecuteAdapterForm } from "@/components/forms/execute-adapter-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { STEP_NODE_PREF } from "@/config/node";
import type { Adapter, CronAdapter, HTTPAdapter } from "@/hooks/dag";
import type { NodeData } from "@/store/flow-store";
import { useFlowStore } from "@/store/flow-store";

interface AdapterNodeProps extends Pick<Node<NodeData>, "data" | "id"> {
  onEdit: (id: string) => void;
  removeNode: (id: string) => void;
}

const iconSize = "h-4 w-4";

const AdapterNode = ({ data, id, onEdit, removeNode }: AdapterNodeProps) => {
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const dagId = useFlowStore((state) => state.dag?.id ?? "");

  const adapterData = useMemo<Adapter>(() => {
    const adapterSpecific = data.data as HTTPAdapter | CronAdapter;
    return {
      _id: data.id,
      id: data.id,
      graphId: dagId,
      name: data.name,
      createdAt: data.createdAt,
      user_id: "",
      // spreads `type` and `meta` from the adapter-specific data
      ...adapterSpecific,
      // `data.input` maps to the top-level `adapter.input`
      input: (data.data as { input?: Record<string, string> }).input ?? {},
    };
  }, [data, dagId]);

  const getIcon = () => {
    const type = data.data.type;

    switch (type) {
      case "http_adapter":
        return <Globe className={iconSize} />;
      case "schedular_adapter":
        return <Calendar className={iconSize} />;
      default:
        return <Zap className={iconSize} />;
    }
  };

  const colors = {
    border: "border-indigo-500/50",
    bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20",
    text: "text-indigo-700 dark:text-indigo-300",
    icon: "text-indigo-600 dark:text-indigo-400",
  };

  return (
    <div
      style={{
        width: STEP_NODE_PREF.style.width,
        height: STEP_NODE_PREF.style.height,
      }}
      className={`flex flex-col rounded-lg border-2 ${colors.border} ${colors.bg} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
    >
      <div className="flex items-center justify-between px-2.5 pt-2 pb-1 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`${colors.icon} flex-shrink-0`}>{getIcon()}</div>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
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

      <div className="px-2.5 pb-1">
        <p className="font-semibold truncate text-sm">{data.name}</p>
      </div>
    </div>
  );
};

export default memo(AdapterNode);
