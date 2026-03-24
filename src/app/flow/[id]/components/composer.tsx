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
import { type DAGModel, type DAGVersion, useDAG, useTables } from "@/hooks/dag";
import { useFlowStore, useTableStore } from "@/store/flow-store";
import type { Tables } from "@/store/table-store";

import { VersionsDialogContent } from "./versions-dialog";

interface FlowEditorProps {
  hydrate: {
    dag: DAGModel;
    tables: Tables;
    versions: DAGVersion[];
  };
}

export function FlowEditorComposer({ hydrate }: FlowEditorProps) {
  const { dag: initialDag, versions, tables: initialTables } = hydrate;
  const { selectedNode, setSelectedNode, setDAG } = useFlowStore();
  const { setTables } = useTableStore();

  const { data: dag } = useDAG(initialDag.id, {
    fallbackData: initialDag,
    revalidateOnMount: false,
  });

  const { data: tables } = useTables({
    fallbackData: initialTables,
    revalidateOnMount: false,
  });

  const [nodeSheetOpen, setNodeSheetOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);

  useEffect(() => {
    setTables(initialTables);
  }, [initialTables, setTables]);

  useEffect(() => {
    setDAG(initialDag);
  }, [initialDag, setDAG]);

  useEffect(() => {
    if (dag) setDAG(dag);
  }, [dag, setDAG]);

  useEffect(() => {
    if (tables) setTables(tables);
  }, [tables, setTables]);

  useEffect(() => {
    setNodeSheetOpen(!!selectedNode?.id);
  }, [selectedNode?.id]);

  return (
    <Sheet
      modal={false}
      open={nodeSheetOpen}
      onOpenChange={(open) => {
        if (!open) setSelectedNode(null);
        setNodeSheetOpen(open);
      }}
    >
      <ResizablePanelGroup direction="horizontal" className="absolute right-0">
        <ResizablePanel>
          <ReactFlowProvider>
            <div className="min-w-[50vw] h-full">
              <SheetContent
                className="border m-auto mr-6 h-19/20 rounded-sm w-[480px] sm:w-[640px]"
                side="left"
              >
                <SheetHeader>
                  <SheetTitle>{selectedNode?.data.id}</SheetTitle>
                  <SheetDescription>
                    Make changes to your DAG node. All changes will be
                    automatically saved.
                  </SheetDescription>
                  <StepForm />
                </SheetHeader>
              </SheetContent>
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
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel></ResizablePanel>
        {/*DB-EDITOR*/}
      </ResizablePanelGroup>
    </Sheet>
  );
}
