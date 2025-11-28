import type { TFormControl } from "../step-form";
import Fields from "./fields";

export function CronAdapterForm({ control }: { control: TFormControl }) {
  return (
    <Fields.Json
      label="Cron Configuration"
      control={control}
      name="data.meta"
    />
  );
}
