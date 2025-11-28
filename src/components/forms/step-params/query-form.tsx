import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTable, useTables } from "@/hooks/dag";
import type { StepFormInput, StepFormOutput, TFormControl } from "../step-form";
import Fields from "./fields";

export function QueryForm({ control }: { control: TFormControl }) {
  const { watch } = useFormContext<StepFormInput, unknown, StepFormOutput>();
  const table = watch("data.meta.table");

  const { data: fetchedTables } = useTables();
  const { data: idxTable } = useTable(table);

  const tables = useMemo(() => fetchedTables?.data || [], [fetchedTables]);
  const columns = useMemo(() => Object.keys(idxTable?.data || {}), [idxTable]);

  return (
    <>
      <Fields.Select
        label="Table"
        control={control}
        name="data.meta.table"
        options={tables}
      />
      <Fields.Json label="Where" control={control} name="data.meta.where" />
      <Fields.Multiselect
        label="Select"
        control={control}
        name="data.meta.select"
        options={columns}
      />
    </>
  );
}
