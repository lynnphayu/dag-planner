"use client";

import { Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { DAGCard } from "@/components/dag-card";
import { Button } from "@/components/ui/button";

import type { DAGModel } from "@/hooks/dag";
import { CreateDAG } from "./creat-dag";

interface HomeClientProps {
  dags: DAGModel[];
  error?: string;
}

export function HomeClient({ dags, error }: HomeClientProps) {
  const router = useRouter();

  const handleDAGClick = (dagId: string) => {
    router.push(`/flow/${dagId}`);
  };

  return (
    <>
      {error && (
        <div className="text-center">
          <p className="text-lg text-destructive">Error loading DAGs</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.refresh()}
          >
            Retry
          </Button>
        </div>
      )}

      {dags.length ? (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {dags.map((dag) => (
            <DAGCard key={dag.id} dag={dag} onClick={handleDAGClick} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Workflow className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No DAGs found</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get started by creating your first DAG. You can build complex
            workflows with multiple steps and dependencies.
          </p>
          <CreateDAG />
        </div>
      )}
    </>
  );
}
