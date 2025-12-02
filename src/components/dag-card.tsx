import { Boxes, ChevronRight, Plug, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DAGModel } from "@/hooks/dag";

interface DAGCardProps {
  dag: DAGModel;
  onClick: (dagId: string) => void;
}

export function DAGCard({ dag, onClick }: DAGCardProps) {
  const nodes = Object.values(dag.nodes);
  const uniqueStepTypes = [...new Set(nodes.map((step) => step.data.type))];
  const adapterCount = dag.adapters?.length ?? 0;

  return (
    <Card
      className="relative cursor-pointer overflow-hidden border bg-card hover:shadow-lg transition-all duration-200 group ring-1 ring-transparent hover:ring-primary/20"
      onClick={() => onClick(dag.id)}
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 blur-0 transition-all duration-300 group-hover:opacity-100 group-hover:blur-[1px]">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5" />
        <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-secondary/10" />
      </div>

      <CardHeader className="py-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-[1.03]">
              <Workflow className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-sm sm:text-base transition-colors group-hover:text-primary">
                {dag.name || dag.id}
              </CardTitle>
            </div>
          </div>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              v{dag.version}.{dag.subversion}
            </Badge>
          </CardAction>
        </div>
        {dag.description ? (
          <CardDescription className="line-clamp-2">
            {dag.description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="pt-0 pb-2">
        <div className="mb-2 grid grid-cols-1 gap-1.5 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Boxes className="h-3.5 w-3.5" />
            <span className="truncate">{nodes.length} nodes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Plug className="h-3.5 w-3.5" />
            <span className="truncate">{adapterCount} adapters</span>
          </div>
        </div>

        {nodes.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {uniqueStepTypes.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] sm:text-xs font-medium text-secondary-foreground"
                >
                  {type}
                </span>
              ))}
              {uniqueStepTypes.length > 3 && (
                <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground">
                  +{uniqueStepTypes.length - 3} more
                </span>
              )}
            </div>
            <div className="pointer-events-none flex items-center gap-1 text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
