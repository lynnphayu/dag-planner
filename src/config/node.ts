import { Position } from "@xyflow/react";

export const GRID_SIZE = 16;

export const STEP_NODE_HEIGHT = GRID_SIZE * 4;
export const STEP_NODE_WIDTH = GRID_SIZE * 13;
export const STEP_NODE_SPACING = GRID_SIZE * 2;

export const TABLE_NODE_HEIGHT = GRID_SIZE * 10;
export const TABLE_NODE_WIDTH = GRID_SIZE * 13;
export const TABLE_NODE_SPACING = GRID_SIZE * 2;

export const TABLE_NODE_PREF = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    width: TABLE_NODE_WIDTH,
    height: TABLE_NODE_HEIGHT,
    borderRadius: 8,
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
  className:
    "transition-transform ease-in-out duration-200 will-change-transform [&.dragging]:!transition-none",
};

export const STEP_NODE_PREF = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    width: STEP_NODE_WIDTH,
    height: STEP_NODE_HEIGHT,
    borderRadius: 8,
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
  className:
    "transition-transform ease-in-out duration-200 will-change-transform [&.dragging]:!transition-none",
};
