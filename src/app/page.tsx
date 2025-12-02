"use client";

import { Plus, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DAGCard } from "@/components/dag-card";
import { CreateDAGForm } from "@/components/forms/create-dag-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDAGs } from "@/hooks/dag";

export default function Home() {
  const { data: dags, isLoading, error } = useDAGs();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  const handleFormCancel = () => {
    setIsCreateDialogOpen(false);
  };

  const handleDAGClick = (dagId: string) => {
    router.push(`/flow/${dagId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading DAGs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive">Error loading DAGs</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">DAG Runner</h1>
            <p className="text-muted-foreground mt-2">
              Manage and execute your directed acyclic graphs
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create New DAG
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New DAG</DialogTitle>
                <DialogDescription>
                  Create a new directed acyclic graph. You can add steps and
                  configure the workflow after creation.
                </DialogDescription>
              </DialogHeader>
              <CreateDAGForm
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* DAG Grid */}
        {dags && dags.length > 0 ? (
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
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First DAG
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New DAG</DialogTitle>
                  <DialogDescription>
                    Create a new directed acyclic graph. You can add steps and
                    configure the workflow after creation.
                  </DialogDescription>
                </DialogHeader>
                <CreateDAGForm
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
