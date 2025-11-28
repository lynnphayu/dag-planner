import type { TFormControl } from "../step-form";
import Fields from "./fields";

export function UpdateForm({ control }: { control: TFormControl }) {
  return (
    <>
      <Fields.Text label="Table" control={control} name="data.meta.table" />
      <Fields.Json label="Set Values" control={control} name="data.meta.set" />
      <Fields.Json label="Where" control={control} name="data.meta.where" />
    </>
  );
}
