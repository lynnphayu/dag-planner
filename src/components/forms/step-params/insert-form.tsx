import type { TFormControl } from "../step-form";
import Fields from "./fields";

export function InsertForm({ control }: { control: TFormControl }) {
  return (
    <>
      <Fields.Text label="Table" control={control} name="data.meta.table" />
      <Fields.Json
        label="Insert Values"
        control={control}
        name="data.meta.map"
      />
    </>
  );
}
