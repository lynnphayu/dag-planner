import { useMemo } from "react";
import type { TFormControl } from "../step-form";
import Fields from "./fields";
import { useTables } from "@/hooks/dag";

export function InsertForm({ control }: { control: TFormControl }) {
  const { data: fetchedTables } = useTables();
  const tables = useMemo(
    () => fetchedTables?.map((t) => ({ value: t.name, label: t.name })) || [],
    [fetchedTables],
  );

  return (
    <>
      <Fields.Select
        label="Table"
        control={control}
        name="data.meta.table"
        options={tables}
      />
      <Fields.Variable
        label="Insert Values"
        control={control}
        name="data.meta.map"
      />
    </>
  );
}
