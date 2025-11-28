import { useMemo } from "react";
import type { TFormControl } from "../step-form";
import Fields from "./fields";
import { useTables } from "@/hooks/dag";

export function InsertForm({ control }: { control: TFormControl }) {
  const { data: fetchedTables } = useTables();
  const tables = useMemo(() => fetchedTables?.data || [], [fetchedTables]);

  return (
    <>
      <Fields.Select label="Table" control={control} name="data.meta.table" options={tables} />
      <Fields.Json
        label="Insert Values"
        control={control}
        name="data.meta.map"
      />
    </>
  );
}
