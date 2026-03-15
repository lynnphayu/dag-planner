"use client";

import type { ReactNode } from "react";
import { DefaultErrorFallback, ErrorBoundary } from "@/components/error-boundary";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={DefaultErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
