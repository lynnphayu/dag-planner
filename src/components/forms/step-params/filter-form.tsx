import type { TFormControl } from "../step-form";
import Fields from "./fields";

export function FilterForm({ control }: { control: TFormControl }) {
  return (
    <Fields.Json label="Filter" control={control} name="data.meta.filter" />
  );
}
