import { Position } from "@xyflow/react";

export const GRID_SIZE = 16;

export const NODE_PREF = {
  type: "CustomNode",
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    width: GRID_SIZE * 13,
    height: GRID_SIZE * 4,
    borderRadius: 8,
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
};
