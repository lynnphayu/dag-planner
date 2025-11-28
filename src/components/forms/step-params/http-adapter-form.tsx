
import { HTTPMethod, AuthType, type TFormControl } from "../step-form";
import Fields from "./fields";
import { useWatch } from "react-hook-form";


export function HTTPAdapterForm({ control }: { control: TFormControl }) {

  const authType = useWatch({ control, name: "data.meta.authType" }) 

  return (
    <>
      <Fields.Select
        label="Method"
        control={control}
        name="data.meta.method"
        options={HTTPMethod.options.map((method) => ({ value: method, label: method.toUpperCase() }))}
      />
      <Fields.Text label="Path" control={control} name="data.meta.path" />
      <Fields.Json label="Headers" control={control} name="data.meta.headers" />
      <Fields.Json label="Body" control={control} name="data.meta.body" />
      <Fields.Json label="Query" control={control} name="data.meta.query" />
      <Fields.Text label="Response" control={control} name="data.meta.response" />
      <Fields.Select
        label="Auth Type"
        control={control}
        name="data.meta.authType"
        options={AuthType.options.map((t) => ({ value: t, label: t }))}
      />
      {authType !== "none" && (
        <Fields.Json label="Auth" control={control} name="data.meta.auth" />
      )}
    </>
  );
}
