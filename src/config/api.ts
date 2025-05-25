import { Position } from "@xyflow/react";

export const API_CONFIG = {
  BASE_URL: "http://localhost:8080/v1",
  ENDPOINTS: {
    DAGS: {
      LIST: "http://localhost:8080/v1/dags",
      DETAIL: (id: string) => `http://localhost:8080/v1/dags/${id}`,
    },
  },
} as const;

export const GRID_SIZE = 20;

export const NODE_PREF = {
  type: "CustomNode",
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    width: 180,
    height: 80,
    borderRadius: 8,
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
};
