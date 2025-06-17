import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Workflow, User, ArrowRight } from "lucide-react";
import { DAGModel } from "@/hooks/use-dag";

interface DAGCardProps {
  dag: DAGModel;
  onClick: (dagId: string) => void;
}

export function DAGCard({ dag, onClick }: DAGCardProps) {
  const uniqueStepTypes = [...new Set(dag.steps.map((step) => step.type))];

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
      onClick={() => onClick(dag.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {dag.name || dag.id}
          </CardTitle>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        {dag.description && (
          <CardDescription>{dag.description}</CardDescription>
        )}
        <CardDescription>
          {dag.steps.length} step{dag.steps.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Workflow className="h-4 w-4" />
            <span>{dag.steps.length} nodes</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Active</span>
          </div>
        </div>

        {/* Step Types Preview */}
        {dag.steps.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {uniqueStepTypes.slice(0, 3).map((type) => (
              <span
                key={type}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {type}
              </span>
            ))}
            {uniqueStepTypes.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                +{uniqueStepTypes.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
