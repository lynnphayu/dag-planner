import { Position } from "@xyflow/react";

export const GRID_SIZE = 20;

export const NODE_PREF = {
  type: "CustomNode",
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    width: 260,
    height: 80,
    borderRadius: 8,
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
};
