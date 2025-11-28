"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { JSONInput } from "@/components/ui/json-input";
import { Label } from "@/components/ui/label";
import { type DAGModel, useDAGMutations } from "@/hooks/dag";

interface ExecuteDAGFormProps {
  dag: DAGModel | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExecuteDAGForm({
  dag,
  onSuccess,
  onCancel,
}: ExecuteDAGFormProps) {
  const { executeDAG } = useDAGMutations();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<unknown>(null);
  const [httpResponse, setHttpResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    url: string;
  } | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionTimestamp, setExecutionTimestamp] = useState<string | null>(
    null,
  );
  const [inputData, setInputData] = useState(() => {
    return dag?.inputSchema ? JSON.stringify(dag.inputSchema, null, 2) : "{}";
  });

  // Update input data when DAG changes
  useEffect(() => {
    if (dag?.inputSchema) {
      setInputData(JSON.stringify(dag.inputSchema, null, 2));
    }
  }, [dag?.inputSchema]);

  const handleExecute = async () => {
    if (!dag?.id) {
      toast.error("No DAG to execute");
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);
    setHttpResponse(null);
    setExecutionError(null);
    setExecutionTimestamp(null);

    try {
      const parsedInput = JSON.parse(inputData);
      const result = await executeDAG(dag.id, parsedInput);
      setExecutionResult(result.data);
      setHttpResponse(result.httpResponse);
      setExecutionTimestamp(new Date().toLocaleString());
      onSuccess?.();
    } catch (error) {
      console.error("Error executing DAG:", error);
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON input data");
        setExecutionError("Invalid JSON input data");
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setExecutionError(errorMessage);
        setExecutionTimestamp(new Date().toLocaleString());
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="input-data">Input Data (JSON)</Label>
        <JSONInput
          id="input-data"
          value={inputData}
          onChange={setInputData}
          placeholder='{"key": "value"}'
          className="text-sm"
          rows={6}
        />
      </div>

      {/* Execution Result Display */}
      {(executionResult || httpResponse || executionError) && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Execution Result</Label>
              {executionTimestamp && (
                <div className="text-xs text-muted-foreground mt-1">
                  Executed at: {executionTimestamp}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setExecutionResult(null);
                setHttpResponse(null);
                setExecutionError(null);
                setExecutionTimestamp(null);
              }}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 p-4 rounded-md border bg-background">
            {executionError ? (
              <div className="text-destructive">
                <div className="font-semibold mb-2">❌ Execution Failed</div>
                <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                  <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-40 text-foreground">
                    {executionError}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-green-400">
                <div className="font-semibold mb-2">
                  ✅ Execution Successful
                </div>

                {/* HTTP Response Details */}
                {httpResponse && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2 text-blue-400">
                      HTTP Response:
                    </div>
                    <div className="bg-muted border border-border rounded p-3 mb-3">
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div>
                          <span className="font-semibold">Status:</span>{" "}
                          <span
                            className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                              httpResponse.status >= 200 &&
                              httpResponse.status < 300
                                ? "bg-green-900/20 text-green-400 border border-green-500/30"
                                : httpResponse.status >= 400
                                  ? "bg-red-900/20 text-red-400 border border-red-500/30"
                                  : "bg-yellow-900/20 text-yellow-400 border border-yellow-500/30"
                            }`}
                          >
                            {httpResponse.status} {httpResponse.statusText}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">URL:</span>{" "}
                          <code className="text-xs bg-muted px-1 rounded text-foreground">
                            {httpResponse.url}
                          </code>
                        </div>
                      </div>
                      {Object.keys(httpResponse.headers).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs font-semibold cursor-pointer text-blue-400 hover:text-blue-300">
                            Response Headers
                          </summary>
                          <pre className="text-xs mt-1 bg-muted p-2 rounded overflow-auto max-h-20 text-foreground">
                            {JSON.stringify(httpResponse.headers, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}

                {/* Response Data */}
                <div>
                  <div className="text-sm font-medium mb-2 text-green-400">
                    Response Data:
                  </div>
                  <div className="bg-muted border border-border rounded p-3">
                    <pre className="text-sm whitespace-pre-wrap font-mono overflow-auto max-h-60 text-foreground">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isExecuting}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleExecute}
          disabled={isExecuting}
          className="min-w-[100px]"
        >
          {isExecuting ? "Executing..." : "Execute DAG"}
        </Button>
      </div>
    </div>
  );
}
