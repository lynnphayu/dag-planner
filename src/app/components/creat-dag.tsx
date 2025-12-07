"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateDAGForm } from "@/components/forms/create-dag-form";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";

export const CreateDAG = () => {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    router.refresh();
  };

  const handleFormCancel = () => {
    setIsCreateDialogOpen(false);
  };
  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
            Create a new directed acyclic graph. You can add steps and configure
            the workflow after creation.
          </DialogDescription>
        </DialogHeader>
        <CreateDAGForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
