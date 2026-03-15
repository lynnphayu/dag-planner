"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Intentionally not using shared UI components — they may be unavailable
// if the root layout itself has crashed (no ThemeProvider, fonts, etc.)
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#09090b",
          color: "#fafafa",
          margin: 0,
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}
        >
          <AlertTriangle style={{ width: 48, height: 48, color: "#ef4444" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#a1a1aa", maxWidth: 400, margin: 0 }}>
            {error.message || "An unexpected error occurred."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              background: "#fafafa",
              color: "#09090b",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
            Try again
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = "/"; }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              background: "transparent",
              color: "#fafafa",
              border: "1px solid #27272a",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Go home
          </button>
        </div>
      </body>
    </html>
  );
}
