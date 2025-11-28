"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FlowComponent } from "@/components/flow/flow-editor";
import { StepForm } from "@/components/forms/step-form";
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
import { useFlowStore } from "@/store/flow-store";

export default function NewDAGPage() {
  const searchParams = useSearchParams();
  const dagName = searchParams.get("name") || "new-dag";
  const schemaParam = searchParams.get("schema");
  const inputSchema = schemaParam
    ? JSON.parse(decodeURIComponent(schemaParam))
    : {};

  const {
    isSheetOpen,
    closeSheet,
    selectedNode,
    nodes,
    edges,
    addEdge,
    removeEdge,
    wouldCreateCycle,
    updateNode,
    initializeNewDAG,
    getDag,
  } = useFlowStore();

  // Initialize new DAG when component mounts
  useEffect(() => {
    initializeNewDAG(dagName, inputSchema);
  }, [dagName, inputSchema, initializeNewDAG]);

  const step = selectedNode();

  return (
    <Sheet
      modal={false}
      open={isSheetOpen}
      onOpenChange={(open) => (open ? true : closeSheet())}
    >
      <ReactFlowProvider>
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
          <FlowComponent />
        </div>
      </ReactFlowProvider>
      <ResizablePanelGroup direction="horizontal">
        <ResizableHandle withHandle />
        <ResizablePanel>
          <SheetContent className="border m-auto mr-6 h-19/20 rounded-sm w-[480px] sm:w-[640px]">
            <SheetHeader>
              <SheetTitle>{step?.data.id}</SheetTitle>
              <SheetDescription>
                Configure your DAG node. All changes will be automatically
                saved.
              </SheetDescription>
              {step && (
                <StepForm
                  {...{
                    getDag,
                    nodes,
                    edges,
                    addEdge,
                    removeEdge,
                    wouldCreateCycle,
                    updateNode,
                    step,
                  }}
                />
              )}
            </SheetHeader>
          </SheetContent>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Sheet>
  );
}
