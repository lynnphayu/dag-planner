import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  JoinForm,
  FilterForm,
  MapForm,
  ConditionForm,
  HTTPForm,
  QueryForm,
  InsertForm,
  UpdateForm,
  DeleteForm,
  InputSchemaForm,
  OutputSchemaForm,
} from "./step-form-params";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { NodeData } from "@/store/flow-store";
import { Edge, Node } from "@xyflow/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConditionParams, DAGModel, useDAGMutations } from "@/hooks/use-dag";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

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
  then: z.array(z.string()).optional(),
  dependsOn: z.array(z.string()).optional(),
});

// Define the condition schema
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

const CustomJSONSchema = z
  .union([z.record(z.any()), z.string()])
  .transform((val, ctx) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch (_e) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid JSON format",
        });
      }
    } else {
      return val;
    }
  })
  .optional();
const DbOperationParamsSchema = z.object({
  table: z.string(),
  where: CustomJSONSchema.optional(),
  // queryParams: QueryParamsSchema.optional(),
  // insertParams: InsertParamsSchema.optional(),
  // updateParams: UpdateParamsSchema.optional(),
  // deleteParams: DeleteParamsSchema.optional(),
});
// Define the params schemas
const QueryParamsSchema = DbOperationParamsSchema.extend({
  type: z.literal("query"),
  select: z
    .union([
      z.string().transform((val) => val.split(",").map((s) => s.trim())),
      z.array(z.string()),
    ])
    .optional(),
}).merge(BaseStepSchema);

const InsertParamsSchema = DbOperationParamsSchema.extend({
  type: z.literal("insert"),
  map: z.record(z.any()),
}).merge(BaseStepSchema);

const UpdateParamsSchema = DbOperationParamsSchema.extend({
  type: z.literal("update"),
  set: z.record(z.any()),
}).merge(BaseStepSchema);

const DeleteParamsSchema = DbOperationParamsSchema.extend({
  type: z.literal("delete"),
}).merge(BaseStepSchema);

const JoinParamsSchema = z
  .object({
    type: z.literal("join"),
    on: z.record(z.string()),
    joinType: JoinType,
    left: z.string(),
    right: z.string(),
  })
  .merge(BaseStepSchema);

const FilterParamsSchema = z
  .object({
    type: z.literal("filter"),
    filter: CustomJSONSchema,
  })
  .merge(BaseStepSchema);

const MapParamsSchema = z
  .object({
    type: z.literal("map"),
    function: z.string(),
  })
  .merge(BaseStepSchema);

const ConditionParamsSchema = z
  .object({
    type: z.literal("condition"),
    if: ConditionSchema,
    else: z.array(z.string()),
  })
  .merge(BaseStepSchema);

const HTTPParamsSchema = z
  .object({
    type: z.literal("http"),
    method: HTTPMethod,
    url: z.string().url(),
    headers: CustomJSONSchema.optional(),
    body: CustomJSONSchema.optional(),
    query: CustomJSONSchema.optional(),
  })
  .merge(BaseStepSchema);

export const InputParamsSchema = z
  .object({
    type: z.literal("input"),
    schema: CustomJSONSchema.optional(),
  })
  .merge(BaseStepSchema);

export const OutputPramsSchema = z
  .object({
    type: z.literal("output"),
    schema: CustomJSONSchema.optional(),
    source: z.string(),
  })
  .merge(BaseStepSchema);

// Define the main step schema
export const stepSchema = z.discriminatedUnion("type", [
  QueryParamsSchema,
  InsertParamsSchema,
  UpdateParamsSchema,
  DeleteParamsSchema,
  ConditionParamsSchema,
  JoinParamsSchema,
  FilterParamsSchema,
  MapParamsSchema,
  HTTPParamsSchema,
  InputParamsSchema,
  OutputPramsSchema,
]);

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
  const form = useForm<
    z.input<typeof stepSchema>,
    unknown,
    z.output<typeof stepSchema>
  >({
    resolver: zodResolver(stepSchema),
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
    console.log(form.getValues("then"));
    updateNode(step.id, {
      ...step.data,
      then: form.getValues("then")?.filter((id) => id !== edgeId) || [],
    });
    form.setValue(
      "then",
      form.getValues("then")?.filter((id) => id !== edgeId) || []
    );
    removeEdge(edgeId);
  };

  const { createDAG, updateDAG } = useDAGMutations();

  async function onSubmit(values: z.output<typeof stepSchema>) {
    console.log("Step form submitted with values:", values);
    try {
      updateNode(step.id, values);
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

  useEffect(() => {
    console.log("Step data for form:", step.data);
    console.log("Step ID:", step.id);
    form.reset(step.data);
  }, [step.id, form, step.data]);

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          console.log("Form submit event triggered");
          form.handleSubmit(onSubmit, onInvalidSubmit)(e);
        }}
        className="space-y-4"
      >
        {form.watch("type") !== "input" && form.watch("type") !== "output" && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter step name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {form.watch("type") !== "input" && (
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Step Type</FormLabel>
                <Select
                  onValueChange={(e) => {
                    form.setValue("name", "output");
                    field.onChange(e);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a step type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="input">Input</SelectItem>
                    <SelectItem value="output">Output</SelectItem>
                    <SelectItem value="query">Query</SelectItem>
                    <SelectItem value="insert">Insert</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="join">Join</SelectItem>
                    <SelectItem value="filter">Filter</SelectItem>
                    <SelectItem value="map">Map</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                    <SelectItem value="http">HTTP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {form.watch("type") === "query" && <QueryForm control={form.control} />}
        {form.watch("type") === "insert" && (
          <InsertForm control={form.control} />
        )}
        {form.watch("type") === "update" && (
          <UpdateForm control={form.control} />
        )}
        {form.watch("type") === "delete" && (
          <DeleteForm control={form.control} />
        )}
        {form.watch("type") === "join" && <JoinForm control={form.control} />}
        {form.watch("type") === "filter" && (
          <FilterForm control={form.control} />
        )}
        {form.watch("type") === "map" && <MapForm control={form.control} />}
        {form.watch("type") === "condition" && (
          <ConditionForm control={form.control} />
        )}
        {form.watch("type") === "http" && <HTTPForm control={form.control} />}
        {form.watch("type") === "input" && (
          <InputSchemaForm control={form.control} />
        )}
        {form.watch("type") === "output" && (
          <OutputSchemaForm control={form.control} />
        )}
        {form.watch("type") !== "input" && form.watch("type") !== "output" && (
          <FormItem>
            <FormLabel>Then (Next Steps)</FormLabel>
            <Select
              onValueChange={(targetId) => {
                if (!wouldCreateCycle(step.id, targetId)) {
                  handleEdgeAdd(step.id, targetId);
                  form.setValue("then", [
                    ...(form.getValues("then") || []),
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
                      node.id !== "input"
                  )
                  .map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {step.data.then?.map((stepId) => {
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
        {form.watch("type") !== "input" && form.watch("type") !== "output" && (
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
                      !step.data.then?.includes(node.id) &&
                      !(step.data as ConditionParams).else?.includes(node.id) &&
                      node.id !== "input"
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
