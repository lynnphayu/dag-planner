"use client";
import { ReactFlowProvider } from "@xyflow/react";
import { useParams } from "next/navigation";
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
import { useAdapters, useDAG } from "@/hooks/dag";
import { useFlowStore } from "@/store/flow-store";

export default function FlowPage(props: Record<string, unknown>) {
  const { id: dagId } = useParams();
  const {
    data: dagResponse,
    isLoading: isDagLoading,
    error: isDagError,
  } = useDAG(dagId as string);
  const { data: adapters } = useAdapters(dagId as string);

  const isLoading = isDagLoading;
  const isError = isDagError;

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
    setDAG,
    getDag,
  } = useFlowStore();

  // Initialize flow when DAG data is loaded
  useEffect(() => {
    if (dagResponse) setDAG(dagResponse, adapters);
  }, [dagResponse, adapters, setDAG]);

  if (isLoading) {
    return <div>Loading DAG...</div>;
  }

  if (isError) {
    return <div>Error loading DAG</div>;
  }
  const step = selectedNode();

  return (
    <Sheet
      modal={false}
      open={isSheetOpen}
      onOpenChange={(open) => (open ? true : closeSheet())}
    >
      <ReactFlowProvider>
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
          <FlowComponent {...props} />
        </div>
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
