"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";

interface JSONInputProps
  extends Omit<React.ComponentProps<"textarea">, "value" | "onChange"> {
  value?: string | Record<string, unknown> | unknown;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

function JSONInput({
  className,
  value,
  onChange,
  onValidationChange,
  placeholder = "{}",
  ...props
}: JSONInputProps) {
  const [internalValue, setInternalValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Convert incoming value to formatted JSON string
  React.useEffect(() => {
    if (value === undefined || value === null) {
      setInternalValue("");
      return;
    }

    try {
      if (typeof value === "string") {
        // If it's already a string, try to parse and format it
        if (value.trim() === "") {
          setInternalValue("");
        } else {
          const parsed = JSON.parse(value);
          setInternalValue(JSON.stringify(parsed, null, 2));
        }
      } else {
        // If it's an object, stringify it
        setInternalValue(JSON.stringify(value, null, 2));
      }
      setError(null);
      onValidationChange?.(true);
    } catch (_e) {
      // If parsing fails, just set the string value as-is
      if (typeof value === "string") {
        setInternalValue(value);
      } else {
        setInternalValue(JSON.stringify(value, null, 2));
      }
    }
  }, [value, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    // Validate JSON
    if (newValue.trim() === "") {
      setError(null);
      onValidationChange?.(true);
      onChange?.(newValue);
      return;
    }

    try {
      JSON.parse(newValue);
      setError(null);
      onValidationChange?.(true);
      onChange?.(newValue);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Invalid JSON format";
      setError(errorMessage);
      onValidationChange?.(false, errorMessage);
      onChange?.(newValue); // Still call onChange to update the form state
    }
  };

  const handleBlur = () => {
    // Try to format JSON on blur if valid
    if (!error && internalValue.trim() !== "") {
      try {
        const parsed = JSON.parse(internalValue);
        const formatted = JSON.stringify(parsed, null, 2);
        setInternalValue(formatted);
        onChange?.(formatted);
      } catch {
        // If parsing fails, leave as-is
      }
    }
  };

  return (
    <div className="relative">
      <Textarea
        className={`font-mono ${className || ""}`}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p className="text-xs text-destructive mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

export { JSONInput };
