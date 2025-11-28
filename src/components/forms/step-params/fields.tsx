import type { FieldPath } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { JSONInput } from "@/components/ui/json-input";
import { MultiSelect } from "@/components/ui/multiselect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StepFormInput, TFormControl } from "../step-form";

const fields = {
  Text: ({
    control,
    name,
    label,
  }: {
    control: TFormControl;
    name: FieldPath<StepFormInput>;
    label: string;
  }) => {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  },
  Json: ({
    control,
    name,
    label,
  }: {
    control: TFormControl;
    name: FieldPath<StepFormInput>;
    label: string;
  }) => {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <JSONInput
                placeholder='{"field": "value"}'
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  },
  Select: <
    P extends string | number,
    T extends
      | Record<string, P>
      | { label: string; value: P }[]
      | (string | number)[],
  >({
    control,
    name,
    options,
    label,
  }: {
    control: TFormControl;
    name: FieldPath<StepFormInput>;
    options: T;
    label: string;
  }) => {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Select
                {...field}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a value" />
                  </SelectTrigger>
                </FormControl>
                <FormControl>
                  <SelectContent>
                    {Array.isArray(options)
                      ? options.map((option) =>
                          typeof option === "object" ? (
                            <SelectItem
                              key={option.label}
                              value={option.value.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ) : (
                            <SelectItem key={option} value={option.toString()}>
                              {option}
                            </SelectItem>
                          ),
                        )
                      : Object.entries(options).map(([label, value]) => (
                          <>
                            <SelectItem key={label} value={value.toString()}>
                              {label}
                            </SelectItem>
                          </>
                        ))}
                  </SelectContent>
                </FormControl>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  },
  Multiselect: <
    P extends string | number,
    T extends
      | Record<string, P>
      | { label: string; value: P }[]
      | (string | number)[],
  >({
    control,
    name,
    options,
    label,
  }: {
    control: TFormControl;
    name: FieldPath<StepFormInput>;
    options: T;
    label: string;
  }) => {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <MultiSelect
                {...field}
                options={
                  Array.isArray(options)
                    ? options.map((option) =>
                        typeof option === "object"
                          ? { label: option.label, value: option.value }
                          : {
                              label: option.toString(),
                              value: option.toString(),
                            },
                      )
                    : Object.entries(options).map(([label, value]) => ({
                        label,
                        value,
                      }))
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  },
};

export default fields;
