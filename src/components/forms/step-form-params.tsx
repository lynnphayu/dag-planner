import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { stepSchema } from "./step-form";
import { z } from "zod";

export function QueryForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="table"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Table</FormLabel>
            <FormControl>
              <Input placeholder="Enter table name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="where"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Where Conditions (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"field": "value"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value || ""
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="select"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Fields</FormLabel>
            <FormControl>
              <Input
                placeholder="field1, field2, field3"
                {...field}
                value={
                  Array.isArray(field.value)
                    ? field.value.join(", ")
                    : field.value || ""
                }
                onChange={(e) =>
                  field.onChange(
                    (e.target.value.split(",") || "")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function InsertForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="table"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Table</FormLabel>
            <FormControl>
              <Input placeholder="Enter table name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="map"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Insert Values (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"field": "value"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function UpdateForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="table"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Table</FormLabel>
            <FormControl>
              <Input placeholder="Enter table name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="set"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Set Values (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"field": "value"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="where"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Where Conditions (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"field": "value"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function DeleteForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="table"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Table</FormLabel>
            <FormControl>
              <Input placeholder="Enter table name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="where"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Where Conditions (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"field": "value"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function JoinForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Join Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select join type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="inner">Inner Join</SelectItem>
                <SelectItem value="left">Left Join</SelectItem>
                <SelectItem value="right">Right Join</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="left"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Left Table</FormLabel>
            <FormControl>
              <Input placeholder="Enter left table" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="right"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Right Table</FormLabel>
            <FormControl>
              <Input placeholder="Enter right table" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="on"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Join Conditions (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"field": "value"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function FilterForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="filter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Filter Conditions (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"field": "value"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function MapForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="function"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Map Function</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter map function" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function ConditionForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="if"
        render={({ field }) => (
          <FormItem>
            <FormLabel>If Condition (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"left": "value1", "operator": "eq", "right": "value2"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value || ""
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="else"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Else Steps</FormLabel>
            <FormControl>
              <Input
                placeholder="Comma-separated step IDs"
                {...field}
                onChange={(e) =>
                  field.onChange(e.target.value.split(",").map((s) => s.trim()))
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function HTTPForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>HTTP Method</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select HTTP method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL</FormLabel>
            <FormControl>
              <Input placeholder="Enter URL" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="headers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Headers (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"Content-Type": "application/json"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value || ""
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="body"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Body (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"key": "value"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value || ""
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="query"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Query Parameters (JSON)</FormLabel>
            <FormControl>
              <Textarea
                placeholder='{"param": "value"}'
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value || ""
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function InputSchemaForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="schema"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Schema</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter schema"
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value || ""
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function OutputSchemaForm({
  control,
}: {
  control: Control<z.input<typeof stepSchema>>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="schema"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Schema</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter schema"
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value || ""
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="source"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Source</FormLabel>
            <FormControl>
              <Input placeholder="Source" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
