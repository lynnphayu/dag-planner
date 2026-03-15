"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  type FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";
import { Button } from "@/components/ui/button";

export { ReactErrorBoundary as ErrorBoundary };

export function DefaultErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const err = error instanceof Error ? error : new Error(String(error));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {err.message || "An unexpected error occurred."}
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={resetErrorBoundary} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Go home
        </Button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 max-w-xl text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Stack trace
          </summary>
          <pre className="mt-2 overflow-auto rounded border p-3 text-xs text-muted-foreground">
            {err.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
