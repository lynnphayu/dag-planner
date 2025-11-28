import type { TFormControl } from "../step-form";
import Fields from "./fields";

export function ConditionForm({ control }: { control: TFormControl }) {
  return (
    <>
      <Fields.Json label="If" control={control} name="data.meta.if" />
      <Fields.Text label="Else Steps" control={control} name="data.meta.else" />
    </>
  );
}
