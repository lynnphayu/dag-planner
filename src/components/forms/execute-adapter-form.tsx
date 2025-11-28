"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Adapter, DAGModel } from "@/hooks/dag";
import { useDAGMutations } from "@/hooks/dag";

interface ExecuteAdapterFormProps {

  adapter: Adapter;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExecuteAdapterForm({
  adapter,
  onCancel,
  onSuccess,
}: ExecuteAdapterFormProps) {
  const { executeDAG } = useDAGMutations();
  const [isExecuting, setIsExecuting] = useState(false);
  const keys = useMemo(() => Object.keys(adapter.input || {}), [adapter.input]);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const k of keys) initial[k] = "";
    return initial;
  });

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleExecute = async () => {
    if (!adapter.graphId) {
      toast.error("No DAG to execute");
      return;
    }
    setIsExecuting(true);
    try {
      // Pass adapter context and collected inputs to execution payload
      const payload = {
        adapterId: adapter.id,
        adapterType: adapter.type,
        input: values,
      };
      await executeDAG(adapter.graphId, payload as unknown as Record<string, unknown>);
      onSuccess?.();
    } catch (e) {
      // errors are toasted in executeDAG
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      {keys.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          This adapter has no runtime inputs configured.
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <div key={k} className="space-y-1">
              <Label htmlFor={`input-${k}`}>{k}</Label>
              <Input
                id={`input-${k}`}
                value={values[k] ?? ""}
                onChange={(e) => handleChange(k, e.target.value)}
                placeholder={adapter.input?.[k] || "Enter value"}
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isExecuting}>
            Cancel
          </Button>
        )}
        <Button onClick={handleExecute} disabled={isExecuting} className="min-w-[100px]">
          {isExecuting ? "Executing..." : "Execute"}
        </Button>
      </div>
    </div>
  );
}

