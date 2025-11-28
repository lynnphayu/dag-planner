import type { TFormControl } from "../step-form";
import Fields from "./fields";

export function MapForm({ control }: { control: TFormControl }) {
  return (
    <Fields.Json
      label="Map Function"
      control={control}
      name="data.meta.function"
    />
  );
}
