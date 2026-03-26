import { HTTPMethod, type TFormControl } from "../step-form";
import Fields from "./fields";

export function HTTPForm({ control }: { control: TFormControl }) {
  return (
    <>
      <Fields.Select
        label="Method"
        control={control}
        name="data.meta.method"
        options={HTTPMethod.options.map((method) => ({
          value: method,
          label: method.toUpperCase(),
        }))}
      />
      <Fields.Variable label="URL" control={control} name="data.meta.url" />
      <Fields.Variable
        label="Headers"
        control={control}
        name="data.meta.headers"
      />
      <Fields.Variable label="Body" control={control} name="data.meta.body" />
      <Fields.Variable label="Query" control={control} name="data.meta.query" />
    </>
  );
}
