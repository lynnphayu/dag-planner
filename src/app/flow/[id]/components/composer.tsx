"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState } from "react";
import { FlowComponent } from "@/app/flow/[id]/components/flow-editor";
import { StepForm } from "@/components/forms/step-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type DAGModel, type DAGVersion, useDAG } from "@/hooks/dag";
import { useFlowStore } from "@/store/flow-store";
import { VersionsDialogContent } from "./versions-dialog";

interface FlowEditorProps {
  hydrate: {
    dag: DAGModel;
    tables: string[];
    versions: DAGVersion[];
  };
}

export function FlowEditorComposer({ hydrate }: FlowEditorProps) {
  const { dag: initialDag, versions } = hydrate;
  const { selectedNode, selectedNodeId, setSelectedNodeId, setDAG } =
    useFlowStore();

  const { data: dag } = useDAG(initialDag.id, {
    fallbackData: initialDag,
    revalidateOnMount: false,
  });

  const [nodeSheetOpen, setNodeSheetOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);

  useEffect(() => {
    setDAG(initialDag);
  }, [initialDag, setDAG]);

  useEffect(() => {
    if (dag) setDAG(dag);
  }, [dag, setDAG]);

  useEffect(() => {
    setNodeSheetOpen(!!selectedNodeId);
  }, [selectedNodeId]);

  const step = selectedNode();

  return (
    <Sheet
      modal={false}
      open={nodeSheetOpen}
      onOpenChange={(open) => {
        if (!open) setSelectedNodeId(null);
        setNodeSheetOpen(open);
      }}
    >
      <ReactFlowProvider>
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
          <FlowComponent
            onOpenVersions={() => setIsVersionsOpen(true)}
            canOpenVersions={Boolean(dag?.id ?? initialDag.id)}
          />
        </div>
        <Dialog open={isVersionsOpen} onOpenChange={setIsVersionsOpen}>
          <DialogContent className="sm:max-w-xl">
            <VersionsDialogContent versions={versions ?? []} />
          </DialogContent>
        </Dialog>
      </ReactFlowProvider>
      <ResizablePanelGroup direction="horizontal">
        <ResizableHandle withHandle />
        <ResizablePanel>
          <SheetContent className="border m-auto mr-6 h-19/20 rounded-sm w-[480px] sm:w-[640px]">
            <SheetHeader>
              <SheetTitle>{step?.data.id}</SheetTitle>
              <SheetDescription>
                Make changes to your DAG node. All changes will be automatically
                saved.
              </SheetDescription>
              <StepForm />
            </SheetHeader>
          </SheetContent>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Sheet>
  );
}
