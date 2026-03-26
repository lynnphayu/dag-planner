"use client";

import "./variable-input.css";
import * as React from "react";
import { type DAGVariable, useDAGVariables } from "@/hooks/use-dag-variables";
import { cn } from "@/lib/utils";
import {
  buildInnerHTML,
  createChipElement,
  findTextNodeBeforeCursor,
  normalizeToString,
  readRawFromNode,
} from "./variable-input-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TriggerState {
  active: boolean;
  startOffset: number;
  startNode: Node | null;
}

interface DropdownState {
  open: boolean;
  filter: string;
  position: { top: number; left: number };
}

export interface VariableInputProps {
  value?: unknown;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  singleLine?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseVariableEditorOptions {
  value: unknown;
  resolveLabel: (ref: string) => string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  singleLine?: boolean;
}

function useVariableEditor({
  value,
  resolveLabel,
  onChange,
  onBlur,
  singleLine,
}: UseVariableEditorOptions) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const isInternalChange = React.useRef(false);
  const isFocused = React.useRef(false);
  const trigger = React.useRef<TriggerState>({
    active: false,
    startOffset: 0,
    startNode: null,
  });

  const [isEmpty, setIsEmpty] = React.useState(!normalizeToString(value));
  const [dropdown, setDropdown] = React.useState<DropdownState>({
    open: false,
    filter: "",
    position: { top: 0, left: 0 },
  });

  // Sync external value → DOM (skipped while the user is actively editing)
  React.useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (isFocused.current) return;
    if (!editorRef.current) return;

    const normalized = normalizeToString(value);
    if (readRawFromNode(editorRef.current) !== normalized) {
      editorRef.current.innerHTML = buildInnerHTML(normalized, resolveLabel);
    }
    setIsEmpty(!normalized);
  }, [value, resolveLabel]);

  const closeDropdown = React.useCallback(() => {
    setDropdown((prev) => ({ ...prev, open: false }));
    trigger.current.active = false;
  }, []);

  // Reads the DOM, fires onChange, and updates isEmpty
  const emitChange = React.useCallback(() => {
    if (!editorRef.current) return;
    const raw = readRawFromNode(editorRef.current);
    onChange?.(raw);
    setIsEmpty(!raw);
  }, [onChange]);

  const handleFocus = React.useCallback(() => {
    isFocused.current = true;
  }, []);

  const handleBlur = React.useCallback(() => {
    isFocused.current = false;
    setTimeout(() => {
      if (!isFocused.current) {
        closeDropdown();
        onBlur?.();
      }
    }, 120);
  }, [onBlur, closeDropdown]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!singleLine && !dropdown.open) {
          document.execCommand("insertText", false, "\n");
        }
        return;
      }
      if (e.key === "Escape" && dropdown.open) {
        e.preventDefault();
        closeDropdown();
        return;
      }
      if ((e.key === " " || e.key === "Tab") && dropdown.open) {
        closeDropdown();
        return;
      }
    },
    [dropdown.open, closeDropdown, singleLine],
  );

  const handleInput = React.useCallback(() => {
    if (!editorRef.current) return;
    isInternalChange.current = true;

    const raw = readRawFromNode(editorRef.current);
    onChange?.(raw);
    setIsEmpty(!raw);

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      closeDropdown();
      return;
    }

    const range = sel.getRangeAt(0);
    const found = findTextNodeBeforeCursor(range);
    if (!found) {
      closeDropdown();
      return;
    }

    const { node: textNode, offset: textOffset } = found;
    const textBeforeCursor = (textNode.textContent ?? "").slice(0, textOffset);
    const dollarIndex = textBeforeCursor.lastIndexOf("$");

    if (
      dollarIndex === -1 ||
      /[ \n"{}[\]]/.test(textBeforeCursor.slice(dollarIndex + 1))
    ) {
      closeDropdown();
      return;
    }

    trigger.current = {
      active: true,
      startOffset: dollarIndex + 1,
      startNode: textNode,
    };

    const rect = range.getBoundingClientRect();
    setDropdown({
      open: true,
      filter: textBeforeCursor.slice(dollarIndex + 1),
      position: { top: rect.bottom + 4, left: rect.left },
    });
  }, [onChange, closeDropdown]);

  const insertVariable = React.useCallback(
    (variable: DAGVariable) => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      const t = trigger.current;

      if (t.active && t.startNode?.nodeType === Node.TEXT_NODE) {
        const deleteRange = document.createRange();
        deleteRange.setStart(t.startNode, t.startOffset - 1);
        deleteRange.setEnd(range.startContainer, range.startOffset);
        deleteRange.deleteContents();

        const chip = createChipElement(variable);
        deleteRange.insertNode(chip);

        // Strip surrounding JSON quotes when the chip lands inside a quoted string
        const prevNode = chip.previousSibling;
        if (prevNode?.nodeType === Node.TEXT_NODE) {
          const prevText = prevNode as Text;
          if (prevText.textContent?.endsWith('"')) {
            prevText.textContent = prevText.textContent.slice(0, -1);
            chip.dataset.quoted = "true";
          }
        }
        if (chip.dataset.quoted === "true") {
          const nextNode = chip.nextSibling;
          if (nextNode?.nodeType === Node.TEXT_NODE) {
            const nextText = nextNode as Text;
            if (nextText.textContent?.startsWith('"')) {
              nextText.textContent = nextText.textContent.slice(1);
            }
          }
        }

        const after = document.createRange();
        after.setStartAfter(chip);
        after.collapse(true);
        sel.removeAllRanges();
        sel.addRange(after);
      }

      isInternalChange.current = true;
      emitChange();
      closeDropdown();
      editorRef.current?.focus();
    },
    [emitChange, closeDropdown],
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      document.execCommand(
        "insertText",
        false,
        e.clipboardData.getData("text/plain"),
      );
    },
    [],
  );

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!dropdown.open) return;
    const handler = (e: MouseEvent) => {
      if (!editorRef.current?.contains(e.target as Node)) closeDropdown();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdown.open, closeDropdown]);

  return {
    editorRef,
    isEmpty,
    dropdown,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleInput,
    handlePaste,
    insertVariable,
  };
}

// ─── VariableDropdown ─────────────────────────────────────────────────────────

interface VariableDropdownProps {
  variables: DAGVariable[];
  position: { top: number; left: number };
  onSelect: (variable: DAGVariable) => void;
}

function VariableDropdown({
  variables,
  position,
  onSelect,
}: VariableDropdownProps) {
  return (
    <div
      className="fixed z-50 min-w-[200px] max-w-[280px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md p-1"
      style={{ top: position.top, left: position.left }}
    >
      {variables.map((v) => (
        <button
          key={v.value}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(v);
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none cursor-default",
            "hover:bg-accent hover:text-accent-foreground outline-none transition-colors",
          )}
        >
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium shrink-0",
              v.group === "input"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-violet-500/20 text-violet-400",
            )}
          >
            {v.group}
          </span>
          <span className="truncate">{v.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── VariableInput ────────────────────────────────────────────────────────────

export function VariableInput({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  id,
  singleLine = false,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: VariableInputProps) {
  const { variables, resolveLabel } = useDAGVariables();

  const {
    editorRef,
    isEmpty,
    dropdown,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleInput,
    handlePaste,
    insertVariable,
  } = useVariableEditor({ value, resolveLabel, onChange, onBlur, singleLine });

  const filteredVars = React.useMemo(
    () =>
      variables.filter((v) =>
        v.label.toLowerCase().includes(dropdown.filter.toLowerCase()),
      ),
    [variables, dropdown.filter],
  );

  return (
    <div className="relative">
      <div
        ref={editorRef}
        id={id}
        contentEditable
        tabIndex={0}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onPaste={handlePaste}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        data-placeholder={placeholder}
        data-empty={isEmpty ? "true" : undefined}
        className={cn(
          "variable-editor",
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "w-full rounded-md border bg-transparent px-3 text-sm shadow-xs",
          "transition-[color,box-shadow] outline-none focus-visible:ring-[3px]",
          "font-mono break-words",
          singleLine
            ? "h-9 py-1.5 overflow-x-auto overflow-y-hidden whitespace-nowrap"
            : "min-h-[80px] py-2 whitespace-pre-wrap",
          className,
        )}
      />
      {dropdown.open && filteredVars.length > 0 && (
        <VariableDropdown
          variables={filteredVars}
          position={dropdown.position}
          onSelect={insertVariable}
        />
      )}
    </div>
  );
}
