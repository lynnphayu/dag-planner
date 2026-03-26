import type { TFormControl } from "../step-form";
import Fields from "./fields";

export function UpdateForm({ control }: { control: TFormControl }) {
  return (
    <>
      <Fields.Text label="Table" control={control} name="data.meta.table" />
      <Fields.Variable
        label="Set Values"
        control={control}
        name="data.meta.set"
      />
      <Fields.Variable label="Where" control={control} name="data.meta.where" />
    </>
  );
}
