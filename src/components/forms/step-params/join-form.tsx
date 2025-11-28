import { useMemo } from "react";
import type { TFormControl } from "../step-form";
import Fields from "./fields";

const JOIN_TYPES = [
  { label: "Inner Join", value: "inner" },
  { label: "Left Join", value: "left" },
  { label: "Right Join", value: "right" },
];

export function JoinForm({ control }: { control: TFormControl }) {
  const joinTypes = useMemo(() => JOIN_TYPES, []);

  return (
    <>
      <Fields.Select
        label="Join Type"
        control={control}
        name="data.meta.joinType"
        options={joinTypes}
      />
      <Fields.Text label="Left Table" control={control} name="data.meta.left" />
      <Fields.Text
        label="Right Table"
        control={control}
        name="data.meta.right"
      />
      <Fields.Json label="On" control={control} name="data.meta.on" />
    </>
  );
}
