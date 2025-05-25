"use client";
import { FlowComponent } from "@/components/flow-editor";
import { StepForm } from "@/components/step-form";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Sheet,
} from "@/components/ui/sheet";
import { NodeData, useFlowStore } from "@/store/flow-store";
import { Node, ReactFlowProvider } from "@xyflow/react";
import { useDAG } from "@/hooks/use-dag";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export default function FlowPage(props: Record<string, unknown>) {
  const { id: dagId } = useParams();
  const { dag: dagResponse, isLoading, isError } = useDAG(dagId as string);

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
    if (dagResponse) setDAG(dagResponse);
  }, [dagResponse, setDAG]);

  if (isLoading) {
    return <div>Loading DAG...</div>;
  }

  if (isError) {
    return <div>Error loading DAG</div>;
  }

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
              <SheetTitle>{selectedNode?.data.id}</SheetTitle>
              <SheetDescription>
                Make changes to your DAG node. All changes will be automatically
                saved.
              </SheetDescription>
              {selectedNode && (
                <StepForm
                  {...{
                    getDag,
                    nodes,
                    edges,
                    addEdge,
                    removeEdge,
                    wouldCreateCycle,
                    updateNode,
                    step: selectedNode as Node<NodeData>,
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
