import { useCallback, useMemo } from "react";
import { useFlowStore } from "@/store/flow-store";

export interface DAGVariable {
  label: string;
  value: string;
  group: "input" | "result";
}

export function useDAGVariables() {
  const { dag, nodes, selectedNode } = useFlowStore();

  const inputVariables = useMemo(() => {
    const schemaKeys = Object.keys(dag?.inputSchema || {});
    if (schemaKeys.length > 0) {
      return schemaKeys.map((key) => ({
        label: key,
        value: `$input.${key}`,
        group: "input" as const,
      }));
    }

    const refSet = new Set<string>();
    const INPUT_REF_RE = /\$input\.([a-zA-Z0-9_-]+)/g;
    for (const node of nodes) {
      const serialized = JSON.stringify(node.data);
      let match = INPUT_REF_RE.exec(serialized);
      INPUT_REF_RE.lastIndex = 0;
      while (match !== null) {
        refSet.add(match[1]);
        match = INPUT_REF_RE.exec(serialized);
      }
    }
    return Array.from(refSet).map((key) => ({
      label: key,
      value: `$input.${key}`,
      group: "input" as const,
    }));
  }, [dag, nodes]);

  const resultVariables = useMemo(
    () =>
      nodes
        .filter((n) => n.id !== selectedNode?.id && n.type === "StepNode")
        .map((n) => ({
          label: n.data.name as string,
          value: `$result.${n.id}`,
          group: "result" as const,
        })),
    [nodes, selectedNode?.id],
  );

  const variables = useMemo(
    () => [...inputVariables, ...resultVariables],
    [inputVariables, resultVariables],
  );

  const resolveLabel = useCallback(
    (ref: string): string => {
      if (ref.startsWith("$input.")) return ref.slice("$input.".length);
      const resultPrefix = ref.startsWith("$results.")
        ? "$results."
        : "$result.";
      if (ref.startsWith("$results.") || ref.startsWith("$result.")) {
        const nodeId = ref.slice(resultPrefix.length);
        const node = nodes.find(
          (n) => n.id === nodeId || (n.data.name as string) === nodeId,
        );
        return node?.data.name || nodeId;
      }
      return ref;
    },
    [nodes],
  );

  return { variables, inputVariables, resultVariables, resolveLabel };
}
