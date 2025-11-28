import { zodResolver } from "@hookform/resolvers/zod";
import type { Edge, Node } from "@xyflow/react";
import { X } from "lucide-react";
import type { Control, Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConditionParams, DAGModel } from "@/hooks/dag";
import { useDAGMutations } from "@/hooks/dag";
import type { NodeData } from "@/store/flow-store";
import {
  ConditionForm,
  CronAdapterForm,
  DeleteForm,
  FilterForm,
  HTTPAdapterForm,
  HTTPForm,
  InsertForm,
  JoinForm,
  MapForm,
  QueryForm,
  UpdateForm,
} from "./step-params";
import Fields from "./step-params/fields";

// Define the step types
export const StepType = z.enum([
  "query",
  "insert",
  "update",
  "delete",
  "join",
  "filter",
  "map",
  "condition",
  "http",
  "adapter",
]);

// Define the operators
export const Operator = z.enum([
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "notin",
  "and",
  "or",
]);

// Define the HTTP methods
const HTTPMethod = z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]);

// Define the join types
const JoinType = z.enum(["inner", "left", "right"]);

const BaseStepSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  dependents: z.array(z.string()).optional(),
});

const ConditionSchema = z
  .union([
    z.string(),
    z.object({
      left: z.string(),
      right: z.string(),
      operator: Operator,
    }),
  ])
  .transform((val, ctx) => {
    if (typeof val === "string") {
      try {
        const { left, right, operator } = JSON.parse(val);
        return {
          left: left as string,
          right: right as string,
          operator: operator as z.infer<typeof Operator>,
        };
      } catch (_e) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid JSON format",
        });
        return z.NEVER;
      }
    } else {
      return val;
    }
  });

const CustomJSONSchema = z.record(z.any());
// z.string().transform((val, ctx) => {
//   try {
//     return JSON.parse(val) as Record<string, unknown>;
//   } catch (_e) {
//     ctx.addIssue({
//       code: "custom",
//       message: "Invalid JSON format",
//     });
//     return z.NEVER;
//   }
// });

const DbOpsSchema = z.object({
  table: z.string(),

  where: CustomJSONSchema.optional(),
});

const QueryParamsSchema = z.object({
  type: z.literal("query"),
  input: CustomJSONSchema.optional(),
  meta: DbOpsSchema.extend({
    select: z
      .union([z.string(), z.array(z.string())])
      .transform((x) => (typeof x === "string" ? [x] : x))
      .optional(),
  }),
});

const InsertParamsSchema = z.object({
  type: z.literal("insert"),
  input: CustomJSONSchema.optional(),
  meta: DbOpsSchema.extend({
    map: z.record(z.any()),
  }),
});

const UpdateParamsSchema = z.object({
  type: z.literal("update"),
  input: CustomJSONSchema.optional(),
  meta: DbOpsSchema.extend({
    set: CustomJSONSchema,
  }),
});

const DeleteParamsSchema = z.object({
  type: z.literal("delete"),
  input: CustomJSONSchema.optional(),
  meta: DbOpsSchema.extend({}),
});

const JoinParamsSchema = z.object({
  type: z.literal("join"),
  input: CustomJSONSchema.optional(),
  meta: z.object({
    on: CustomJSONSchema,
    joinType: JoinType,
    left: z.string(),
    right: z.string(),
  }),
});

const FilterParamsSchema = z.object({
  type: z.literal("filter"),
  input: CustomJSONSchema.optional(),
  meta: z.object({
    filter: CustomJSONSchema,
  }),
});

const MapParamsSchema = z.object({
  type: z.literal("map"),
  input: CustomJSONSchema.optional(),
  meta: z.object({
    function: z.string(),
  }),
});

const ConditionParamsSchema = z.object({
  type: z.literal("condition"),
  input: CustomJSONSchema.optional(),
  meta: z.object({
    if: ConditionSchema,
    else: z
      .union([z.string(), z.array(z.string())])
      .transform((val) => (typeof val === "string" ? [val] : val))
      .optional(),
  }),
});

const HTTPParamsSchema = z.object({
  type: z.literal("http"),
  input: CustomJSONSchema.optional(),
  meta: z.object({
    method: HTTPMethod,
    url: z.string().url(),
    headers: CustomJSONSchema.optional(),
    body: CustomJSONSchema.optional(),
    query: CustomJSONSchema.optional(),
  }),
});

const HTTPAdapterParamsSchema = z.object({
  type: z.literal("http_adapter"),
  input: CustomJSONSchema.optional(),
  meta: z.object({
    method: HTTPMethod,
    path: z.string().url(),
    headers: CustomJSONSchema.optional(),
    body: CustomJSONSchema.optional(),
    query: CustomJSONSchema.optional(),
  }),
});

const CronAdapterParamsSchema = z.object({
  type: z.literal("schedular_adapter"),
  input: CustomJSONSchema.optional(),
  meta: z.object({
    schedule: z.string(),
  }),
});

// Define the main step schema (variants identified by data.type)
export const stepSchema = BaseStepSchema.merge(
  z.object({
    data: z.discriminatedUnion("type", [
      QueryParamsSchema,
      InsertParamsSchema,
      UpdateParamsSchema,
      DeleteParamsSchema,
      ConditionParamsSchema,
      JoinParamsSchema,
      FilterParamsSchema,
      MapParamsSchema,
      HTTPParamsSchema,
      HTTPAdapterParamsSchema,
      CronAdapterParamsSchema,
    ]),
  }),
);
export type StepFormInput = z.input<typeof stepSchema>;
export type StepFormOutput = z.output<typeof stepSchema>;
export type TFormControl = Control<StepFormInput, unknown, StepFormOutput>;

export function StepForm({
  getDag,
  step,
  addEdge,
  removeEdge,
  nodes,
  edges,
  updateNode,
  wouldCreateCycle,
}: {
  getDag: () => DAGModel | null;
  step: Node<NodeData>;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  nodes: Node<NodeData>[];
  edges: Edge[];
  updateNode: (nodeId: string, data: NodeData) => void;
  wouldCreateCycle: (sourceId: string, targetId: string) => boolean;
}) {
  // const defaultValues = ((values: NodeData) => {
  //   const data = values satisfies StepFormOutput;
  //   const defaults: Record<string, unknown> = data;
  //   switch (data.data.type) {
  //     case "query":
  //     case "insert":
  //     case "update":
  //     case "delete":
  //       defaults.where = JSON.stringify(data.data.meta.where || {}, null, 2);
  //       break;
  //     case "join":
  //       defaults.on = JSON.stringify(data.data.meta.on || {}, null, 2);
  //       break;
  //     case "filter":
  //       defaults.filter = JSON.stringify(data.data.meta.filter || {}, null, 2);
  //       break;
  //     case "map":
  //       defaults.function = JSON.stringify(
  //         data.data.meta.function || {},
  //         null,
  //         2,
  //       );
  //       break;
  //     case "condition":
  //       defaults.if = JSON.stringify(data.data.meta.if || {}, null, 2);
  //       defaults.else = JSON.stringify(data.data.meta.else || {}, null, 2);
  //       break;
  //     case "http":
  //       defaults.headers = JSON.stringify(
  //         data.data.meta.headers || {},
  //         null,
  //         2,
  //       );
  //       defaults.body = JSON.stringify(data.data.meta.body || {}, null, 2);
  //       defaults.query = JSON.stringify(data.data.meta.query || {}, null, 2);
  //       break;
  //     case "http_adapter":
  //       defaults.headers = JSON.stringify(
  //         data.data.meta.headers || {},
  //         null,
  //         2,
  //       );
  //       defaults.body = JSON.stringify(data.data.meta.body || {}, null, 2);
  //       defaults.query = JSON.stringify(data.data.meta.query || {}, null, 2);
  //       break;
  //     default:
  //   }
  //   defaults.input = JSON.stringify(data.data.input || {}, null, 2);
  //   return defaults;
  // })(step.data) as z.input<typeof stepSchema>;
  const form = useForm<StepFormInput, unknown, StepFormOutput>({
    resolver: zodResolver(stepSchema) as unknown as Resolver<
      StepFormInput,
      unknown,
      StepFormOutput
    >,
    defaultValues: step.data,
  });
  const { t } = useTranslation();

  const outgoingEdges = edges.filter((e) => e.source === step.id);
  const incomingEdges = edges.filter((e) => e.target === step.id);

  const handleEdgeAdd = (source: string, target: string) => {
    addEdge({
      id: `edge-${source}-${target}`,
      source,
      target,
    });
  };

  const handleEdgeRemove = (edgeId: string) => {
    if (
      step.data.data?.type === "http_adapter" ||
      step.data.data?.type === "schedular_adapter"
    ) {
      return;
    } // Adapters don't have edges

    updateNode(step.id, {
      ...step.data,
      dependencies:
        form.getValues("dependencies")?.filter((id: string) => id !== edgeId) ||
        [],
    });
    form.setValue(
      "dependencies",
      form.getValues("dependencies")?.filter((id: string) => id !== edgeId) ||
        [],
    );
    removeEdge(edgeId);
  };

  const { createDAG, updateDAG } = useDAGMutations();

  async function onSubmit(values: z.output<typeof stepSchema>) {
    console.log("Step form submitted with values:", values);
    try {
      // Handle manual transformation for fields that allow string input
      const data = { ...values };
      if (data.data?.type === "query") {
        data.data.meta.select =
          data.data.meta.select?.map((s) => s.trim()).filter(Boolean) || [];
      }
      if (data.data?.type === "condition" && data.data.meta.else) {
        data.data.meta.else = data.data.meta.else
          .map((s) => s.trim())
          .filter(Boolean);
      }

      updateNode(step.id, data);
      const dag = getDag();
      console.log("Current DAG:", dag);
      if (!dag) {
        console.error("No DAG found");
        return;
      }
      if (dag?.id) {
        console.log("Updating existing DAG:", dag.id);
        await updateDAG(dag.id, dag);
      } else {
        console.log("Creating new DAG");
        await createDAG(dag);
      }
      toast.success(t("message.dag_save_success.description"));
    } catch (error) {
      console.error("Error in step form submission:", error);
      toast.error(t("message.dag_save_failed.description"));
    }
  }

  const onInvalidSubmit = (errors: Record<string, unknown>) => {
    console.log("Form validation errors:", errors);
    toast.error("Please fix the form errors before submitting");
  };

  // useEffect(() => {
  //   console.log("Step data for form:", defaultValues);
  //   console.log("Step ID:", step.id);
  //   form.reset(defaultValues);
  // }, [step.id, form, defaultValues]);

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          console.log("Form submit event triggered");
          form.handleSubmit(onSubmit, onInvalidSubmit)(e);
        }}
        className="space-y-4"
      >
        <Fields.Text control={form.control} name="name" label="Name" />
        <Fields.Select
          control={form.control}
          name="data.type"
          label={
            form.watch("data.type").includes("adapter")
              ? "Adapter Type"
              : "Step Type"
          }
          options={
            form.watch("data.type").includes("adapter")
              ? [
                  { value: "http_adapter", label: "HTTP Adapter" },
                  { value: "schedular_adapter", label: "Cron Adapter" },
                ]
              : [
                  { value: "query", label: "Query" },
                  { value: "insert", label: "Insert" },
                  { value: "update", label: "Update" },
                  { value: "delete", label: "Delete" },
                  { value: "join", label: "Join" },
                  { value: "filter", label: "Filter" },
                  { value: "map", label: "Map" },
                  { value: "condition", label: "Condition" },
                  { value: "http", label: "HTTP" },
                ]
          }
        />
        <Fields.Json control={form.control} name="data.input" label="Input" />
        {form.watch("data.type") === "query" && (
          <QueryForm control={form.control} />
        )}
        {form.watch("data.type") === "insert" && (
          <InsertForm control={form.control} />
        )}
        {form.watch("data.type") === "update" && (
          <UpdateForm control={form.control} />
        )}
        {form.watch("data.type") === "delete" && (
          <DeleteForm control={form.control} />
        )}
        {form.watch("data.type") === "join" && (
          <JoinForm control={form.control} />
        )}
        {form.watch("data.type") === "filter" && (
          <FilterForm control={form.control} />
        )}
        {form.watch("data.type") === "map" && (
          <MapForm control={form.control} />
        )}
        {form.watch("data.type") === "condition" && (
          <ConditionForm control={form.control} />
        )}
        {form.watch("data.type") === "http" && (
          <HTTPForm control={form.control} />
        )}
        {form.watch("data.type") === "http_adapter" && (
          <HTTPAdapterForm control={form.control} />
        )}
        {form.watch("data.type") === "schedular_adapter" && (
          <CronAdapterForm control={form.control} />
        )}
        {!form.watch("data.type").includes("adapter") && (
          <FormItem>
            <FormLabel>Then (Next Steps)</FormLabel>
            <Select
              onValueChange={(targetId) => {
                if (!wouldCreateCycle(step.id, targetId)) {
                  handleEdgeAdd(step.id, targetId);
                  form.setValue("dependencies", [
                    ...(form.getValues("dependencies") || []),
                    targetId,
                  ]);
                } else {
                  toast.error(t("message.cycle_detected.title"), {
                    description: t("message.cycle_detected.description"),
                  });
                }
              }}
              value=""
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select next steps" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {nodes
                  .filter(
                    (node) =>
                      node.id !== step.id &&
                      !outgoingEdges.some((e) => e.target === node.id) &&
                      !node.data.data?.type.includes("adapter"),
                  )
                  .map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {step.data.dependencies?.map((stepId: string) => {
                return (
                  <Badge
                    key={stepId}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleEdgeRemove(stepId)}
                  >
                    {nodes.find((n) => n.id === stepId)?.data.name}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                );
              })}
            </div>
          </FormItem>
        )}
        {!form.watch("data.type").includes("adapter") && (
          <FormItem>
            <FormLabel>Depends On</FormLabel>
            <Select
              onValueChange={(sourceId) => {
                if (!wouldCreateCycle(sourceId, step.id)) {
                  handleEdgeAdd(sourceId, step.id);
                } else {
                  toast.error("Invalid Connection", {
                    description:
                      "This connection would create a cycle in the workflow. DAGs must not contain cycles.",
                  });
                }
              }}
              value=""
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select dependencies" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {nodes
                  .filter(
                    (node) =>
                      node.id !== step.id &&
                      !incomingEdges.some((e) => e.source === node.id) &&
                      !node.data.data?.type.includes("adapter") &&
                      !step.data.dependencies?.includes(node.id) &&
                      !(
                        step.data.data as unknown as ConditionParams
                      ).else?.includes(node.id),
                  )
                  .map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {incomingEdges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                return (
                  <Badge
                    key={edge.id}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleEdgeRemove(edge.id)}
                  >
                    {sourceNode?.data.name}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                );
              })}
            </div>
          </FormItem>
        )}

        <Button
          type="submit"
          variant="secondary"
          onClick={() => {
            console.log("Submit button clicked");
            console.log("Form state:", form.formState);
            console.log("Form values:", form.getValues());
          }}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
