"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DAGModel } from "@/hooks/dag";
import { useDAGMutations } from "@/hooks/dag";

// Form schema for validation
const createDAGSchema = z.object({
  name: z
    .string()
    .min(1, "DAG name is required")
    .max(50, "DAG name must be less than 50 characters"),
  description: z.string().optional(),
  inputSchema: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Must be valid JSON"),
});

type CreateDAGFormData = z.infer<typeof createDAGSchema>;

interface CreateDAGFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateDAGForm({ onSuccess, onCancel }: CreateDAGFormProps) {
  const { createDAG } = useDAGMutations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateDAGFormData>({
    resolver: zodResolver(createDAGSchema),
    defaultValues: {
      name: "",
      description: "",
      inputSchema: "{}",
    },
  });

  const onSubmit = async (values: CreateDAGFormData) => {
    setIsSubmitting(true);

    try {
      const parsedInputSchema = JSON.parse(values.inputSchema);

      // Create the DAG via API
      const newDAG: Omit<DAGModel, "id"> = {
        name: values.name,
        description: values.description || "",
        nodes: {},
        inputSchema: parsedInputSchema,
        adapters: [],
        version: 1,
        subversion: 1,
        status: "draft",
      };

      const result = await createDAG(newDAG);

      if (result?.id) {
        toast.success("DAG created successfully");
        form.reset();
        onSuccess?.();

        // Navigate to the flow editor for the created DAG
        router.push(`/flow/${result.id}`);
      } else {
        toast.error("Failed to create DAG - no ID returned");
      }
    } catch (error) {
      console.error("Error creating DAG:", error);
      toast.error(
        `Failed to create DAG: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DAG Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter DAG name"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                A unique name for your DAG. This will be used as the identifier.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this DAG does"
                  {...field}
                  disabled={isSubmitting}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                A brief description of what this workflow accomplishes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inputSchema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Input Schema</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{"field1": "string", "field2": "number"}'
                  {...field}
                  disabled={isSubmitting}
                  className="font-mono text-sm"
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                JSON schema defining the expected input structure for this DAG.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? "Creating..." : "Create DAG"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
