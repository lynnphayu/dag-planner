import { useMemo } from "react";
import type { TFormControl } from "../step-form";
import Fields from "./fields";

const HTTP_METHODS = ["get", "post", "put", "delete", "patch"];

export function HTTPAdapterForm({ control }: { control: TFormControl }) {
  const methods = useMemo(() => HTTP_METHODS, []);

  return (
    <>
      <Fields.Select
        label="Method"
        control={control}
        name="data.meta.method"
        options={methods}
      />
      <Fields.Text label="Path" control={control} name="data.meta.path" />
      <Fields.Json label="Headers" control={control} name="data.meta.headers" />
      <Fields.Json label="Body" control={control} name="data.meta.body" />
      <Fields.Json label="Query" control={control} name="data.meta.query" />
    </>
  );
}
