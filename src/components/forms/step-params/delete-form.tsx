import type { TFormControl } from "../step-form";
import Fields from "./fields";

export function DeleteForm({ control }: { control: TFormControl }) {
  return (
    <>
      <Fields.Text label="Table" control={control} name="data.meta.table" />
      <Fields.Json label="Where" control={control} name="data.meta.where" />
    </>
  );
}

