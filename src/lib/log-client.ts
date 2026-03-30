import { serializeError } from "@/lib/log-serialize";

export function logClientError(
  scope: string,
  err: unknown,
  extra?: Record<string, unknown>,
): void {
  const payload = {
    ts: new Date().toISOString(),
    layer: "client" as const,
    scope,
    err: serializeError(err),
    ...extra,
  };
  console.error(JSON.stringify(payload));
}
